using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace debt_payment_backend.DebtService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }
        public DbSet<Debt> Debts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Debt>()
                .HasIndex(d => d.UserId)
                .HasDatabaseName("IX_Debt_UserId");
        }
    }
}