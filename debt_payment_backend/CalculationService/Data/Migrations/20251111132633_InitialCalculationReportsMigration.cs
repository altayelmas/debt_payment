using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CalculationService.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCalculationReportsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CalculationReports",
                columns: table => new
                {
                    CalculationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReportDataJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalculationReports", x => x.CalculationId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CalculationReport_UserId",
                table: "CalculationReports",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CalculationReports");
        }
    }
}
