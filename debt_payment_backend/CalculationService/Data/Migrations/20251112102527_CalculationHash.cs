using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CalculationService.Data.Migrations
{
    /// <inheritdoc />
    public partial class CalculationHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ScenarioHash",
                table: "CalculationReports",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CalculationReport_ScenarioHash",
                table: "CalculationReports",
                column: "ScenarioHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CalculationReport_ScenarioHash",
                table: "CalculationReports");

            migrationBuilder.DropColumn(
                name: "ScenarioHash",
                table: "CalculationReports");
        }
    }
}
