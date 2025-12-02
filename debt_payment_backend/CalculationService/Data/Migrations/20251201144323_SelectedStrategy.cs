using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CalculationService.Data.Migrations
{
    /// <inheritdoc />
    public partial class SelectedStrategy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SelectedStrategy",
                table: "UserActivePlans",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SelectedStrategy",
                table: "UserActivePlans");
        }
    }
}
