using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace CalculationService.Data
{
    public static class MigrationHelper
    {
        public static void ApplyCalculationMigrations(this IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                try
                {
                    var dbCreator = dbContext.Database.GetService<IDatabaseCreator>() as RelationalDatabaseCreator;

                    if (dbCreator != null)
                    {
                        if (!dbCreator.Exists())
                        {
                            Console.WriteLine("DebtService: Creating database...");
                            dbCreator.Create();
                            Console.WriteLine("DebtService: Database created.");
                        }
                    }

                    Console.WriteLine("Applying migrations...");
                    if (dbContext.Database.IsRelational())
                    {
                        dbContext.Database.Migrate();
                    }
                    Console.WriteLine("Migrations applied.");
                } catch (Exception ex)
                {
                    Console.WriteLine($"IdentityService: Error during database preparation: {ex.Message}");
                    throw;
                }
            }
        }
    }
}