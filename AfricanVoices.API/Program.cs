using AfricanVoices.API.Configuration;
using AfricanVoices.API.Data;
using AfricanVoices.API.DTOs;
using AfricanVoices.API.Middleware;
using AfricanVoices.API.Repositories;
using AfricanVoices.API.Repositories.Interfaces;
using AfricanVoices.API.Services;
using AfricanVoices.API.Services.Interfaces;
using AfricanVoices.API.Validators;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;

// ── Serilog bootstrap ────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, config) =>
        config.ReadFrom.Configuration(ctx.Configuration)
              .ReadFrom.Services(services)
              .Enrich.FromLogContext()
              .WriteTo.Console()
              .WriteTo.File("logs/african-voices-.log", rollingInterval: RollingInterval.Day));

    // ── Configuration ────────────────────────────────────────────────────────
    builder.Services.Configure<AzureSpeechSettings>(
        builder.Configuration.GetSection(AzureSpeechSettings.SectionName));
    builder.Services.Configure<FileStorageSettings>(
        builder.Configuration.GetSection(FileStorageSettings.SectionName));
    builder.Services.Configure<CorsSettings>(
        builder.Configuration.GetSection(CorsSettings.SectionName));

    // ── Database ─────────────────────────────────────────────────────────────
    builder.Services.AddDbContext<AfricanVoicesDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            npgsqlOptions => npgsqlOptions.CommandTimeout(60)));

    // ── Repositories & Services ───────────────────────────────────────────────
    builder.Services.AddScoped<IStoryRepository, StoryRepository>();
    builder.Services.AddScoped<IStoryService, StoryService>();
    builder.Services.AddScoped<IFileStorageService, FileStorageService>();
    builder.Services.AddScoped<ISpeechService, SpeechService>();

    // ── Validation ───────────────────────────────────────────────────────────
    builder.Services.AddScoped<IValidator<CreateStoryDto>, CreateStoryDtoValidator>();
    builder.Services.AddScoped<IValidator<UpdateStoryDto>, UpdateStoryDtoValidator>();

    // ── CORS ─────────────────────────────────────────────────────────────────
    var corsOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? new[] { "http://localhost:5173" };

    builder.Services.AddCors(options =>
        options.AddPolicy("AfricanVoicesPolicy", policy =>
            policy.WithOrigins(corsOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()));

    // ── Controllers ───────────────────────────────────────────────────────────
    builder.Services.AddControllers();

    // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "African Voices API",
            Version = "v1",
            Description = "A digital heritage platform preserving African oral histories, cultural stories, folklore, and community narratives.",
            Contact = new OpenApiContact { Name = "African Voices", Email = "hello@africanvoices.app" }
        });

        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            c.IncludeXmlComments(xmlPath);
    });

    // ── File upload limit ─────────────────────────────────────────────────────
    builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
    {
        o.MultipartBodyLengthLimit = 110_000_000;
    });

    var app = builder.Build();

    // ── Auto-migrate on startup ───────────────────────────────────────────────
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AfricanVoicesDbContext>();
        db.Database.Migrate();
    }

    // ── Middleware pipeline ───────────────────────────────────────────────────
    app.UseErrorHandling();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "African Voices API v1");
            c.RoutePrefix = "swagger";
        });
    }

    app.UseHttpsRedirection();
    app.UseCors("AfricanVoicesPolicy");

    // Serve uploaded audio files
    var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
    Directory.CreateDirectory(uploadsPath); // ensure it exists
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads"
    });

    app.UseAuthorization();
    app.MapControllers();

    Log.Information("African Voices API starting on {Environment}", app.Environment.EnvironmentName);
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "African Voices API failed to start");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
