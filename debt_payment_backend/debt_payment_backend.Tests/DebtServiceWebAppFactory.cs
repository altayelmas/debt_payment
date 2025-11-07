using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using System.Linq;
using debt_payment_backend.DebtService.Data;
using System;
using debt_payment_backend.DebtService.Controller;
using Microsoft.AspNetCore.TestHost;

namespace debt_payment_backend.Tests
{

    public class DebtServiceWebAppFactory : WebApplicationFactory<DebtController>
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
                    options.UseInMemoryDatabase("SharedTestDatabase");
                });

                var authServiceDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IAuthenticationService));

                if (authServiceDescriptor != null)
                {
                    services.Remove(authServiceDescriptor);
                }

                var authHandlerDescriptors = services.Where(
                d => d.ServiceType.IsAssignableTo(typeof(IAuthenticationHandler))).ToList();

                foreach (var descriptor in authHandlerDescriptors)
                {
                    services.Remove(descriptor);
                }
                
                services.AddAuthentication(options =>
                {
                options.DefaultAuthenticateScheme = TestAuthHandler.TestAuthScheme;
                options.DefaultChallengeScheme = TestAuthHandler.TestAuthScheme;
                options.DefaultScheme = TestAuthHandler.TestAuthScheme;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.TestAuthScheme, options => { });
            });

            builder.UseEnvironment("Development");
        }
    }
}