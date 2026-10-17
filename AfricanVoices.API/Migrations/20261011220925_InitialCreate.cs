using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AfricanVoices.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Language = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Region = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AudioFilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Transcript = table.Column<string>(type: "text", nullable: true),
                    Summary = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ContributorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ContributorEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: true),
                    TranscriptionStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stories_Category",
                table: "Stories",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_CreatedDate",
                table: "Stories",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_Language",
                table: "Stories",
                column: "Language");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_Region",
                table: "Stories",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_Title",
                table: "Stories",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_TranscriptionStatus",
                table: "Stories",
                column: "TranscriptionStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stories");
        }
    }
}
