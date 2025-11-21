using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using debt_payment_backend.IdentityService.Data;
using debt_payment_backend.IdentityService.Controller;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace debt_payment_backend.Tests
{
    public class IdentityServiceWebAppFactory : WebApplicationFactory<AuthController> 
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureTestServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("IdentityServiceInMemoryDb");
                });
            });

            builder.UseEnvironment("Development");
        }
    }
}