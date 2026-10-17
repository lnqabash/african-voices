using AfricanVoices.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AfricanVoices.API.Data;

public class AfricanVoicesDbContext : DbContext
{
    public AfricanVoicesDbContext(DbContextOptions<AfricanVoicesDbContext> options)
        : base(options) { }

    public DbSet<Story> Stories => Set<Story>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Story>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(e => e.Description)
                .HasMaxLength(2000);

            entity.Property(e => e.Language)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Region)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.AudioFilePath)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.Transcript)
                .HasColumnType("text");

            entity.Property(e => e.Summary)
                .HasMaxLength(1000);

            entity.Property(e => e.ContributorName)
                .HasMaxLength(200);

            entity.Property(e => e.ContributorEmail)
                .HasMaxLength(200);

            entity.Property(e => e.Tags)
                .HasMaxLength(500);

            entity.Property(e => e.TranscriptionStatus)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Indexes
            entity.HasIndex(e => e.Language);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Region);
            entity.HasIndex(e => e.CreatedDate);
            entity.HasIndex(e => e.TranscriptionStatus);

            // Full-text search index (PostgreSQL specific)
            entity.HasIndex(e => e.Title).HasDatabaseName("IX_Stories_Title");
        });
    }
}
