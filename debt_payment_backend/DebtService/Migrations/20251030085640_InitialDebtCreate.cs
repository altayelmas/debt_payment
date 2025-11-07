using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DebtService.Migrations
{
    /// <inheritdoc />
    public partial class InitialDebtCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Debts",
                columns: table => new
                {
                    DebtId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    InterestRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    MinPayment = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Debts", x => x.DebtId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Debt_UserId",
                table: "Debts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Debts");
        }
    }
}
