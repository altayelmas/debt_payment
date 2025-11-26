using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DebtService.Migrations
{
    /// <inheritdoc />
    public partial class AddReportIdToPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CalculationReportId",
                table: "ActualPayments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CalculationReportId",
                table: "ActualPayments");
        }
    }
}
