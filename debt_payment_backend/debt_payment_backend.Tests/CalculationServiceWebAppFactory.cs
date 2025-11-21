using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CalculationService.Data;
using debt_payment_backend.CalculationService.Controller;
using MassTransit;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Moq.Protected;

namespace debt_payment_backend.Tests
{
    public class CalculationServiceWebAppFactory : WebApplicationFactory<CalculationController>, IAsyncLifetime
    {
        public Mock<HttpMessageHandler> MockHttpMessageHandler { get; } = new Mock<HttpMessageHandler>(MockBehavior.Loose);

        public Task InitializeAsync() => Task.CompletedTask;

        public new Task DisposeAsync() {
            MockHttpMessageHandler.Reset();
            return base.DisposeAsync().AsTask();
        }
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
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
                        options.UseInMemoryDatabase("CalculationServiceInMemoryDb");
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

                    var client = new HttpClient(MockHttpMessageHandler.Object)
                    {
                        BaseAddress = new Uri("http://localhost:5002")
                    };

                    var httpClientFactoryDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(IHttpClientFactory));

                    if (httpClientFactoryDescriptor != null)
                    {
                        services.Remove(httpClientFactoryDescriptor);
                    }

                    var mockHttpClientFactory = new Mock<IHttpClientFactory>();

                    mockHttpClientFactory
                        .Setup(_ => _.CreateClient(It.IsAny<string>()))
                        .Returns(client);

                    services.AddSingleton(mockHttpClientFactory.Object);

                    var publishEndpointDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IPublishEndpoint));
                    if (publishEndpointDescriptor != null) services.Remove(publishEndpointDescriptor);

                    var busDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IBus));
                    if (busDescriptor != null) services.Remove(busDescriptor);

                    var mockPublishEndpoint = new Mock<IPublishEndpoint>();

                    mockPublishEndpoint
                    .Setup(x => x.Publish(It.IsAny<object>(), It.IsAny<CancellationToken>()))
                    .Returns(Task.CompletedTask);

                    services.AddSingleton(mockPublishEndpoint.Object);
                });

                builder.UseEnvironment("Development");
            }
        }
    }
}