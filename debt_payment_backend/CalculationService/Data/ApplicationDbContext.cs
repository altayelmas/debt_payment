using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace CalculationService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }
        public DbSet<CalculationReport> CalculationReports { get; set; }
        public DbSet<UserActivePlan> UserActivePlans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<CalculationReport>()
                .HasIndex(d => d.UserId)
                .HasDatabaseName("IX_CalculationReport_UserId");
        }
    }
}