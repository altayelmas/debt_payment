using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Data;
using debt_payment_backend.IdentityService.Model.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace debt_payment_backend.Tests
{
    public class IdentityServiceIntegrationTests : IClassFixture<IdentityServiceWebAppFactory>
    {
        private readonly HttpClient _client;
        private readonly IdentityServiceWebAppFactory _factory;
        private readonly string _testEmail = $"testuser_{Guid.NewGuid()}@example.com";
        private readonly string _testPassword = "Password123!";

        public IdentityServiceIntegrationTests(IdentityServiceWebAppFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();

            using (var scope = _factory.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.Database.EnsureCreated();
            }
        }

        [Fact]
        public async Task Register_ShouldSucceed_WithValidData()
        {
            var registerDto = new UserRegisterDto
            {
                Email = _testEmail,
                Password = _testPassword
            };

            var postResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

            postResponse.EnsureSuccessStatusCode();

            using (var scope = _factory.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var userInDb = await dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email == _testEmail);

                Assert.NotNull(userInDb);
                Assert.Equal(_testEmail, userInDb.UserName);
            }
        }

        [Fact]
        public async Task Login_ShouldSucceed_AfterRegistering()
        {
            var registerDto = new UserRegisterDto
            {
                Email = _testEmail,
                Password = _testPassword
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerDto);

            var loginDto = new UserLoginDto
            {
                Email = _testEmail,
                Password = _testPassword
            };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            loginResponse.EnsureSuccessStatusCode();

            var authResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
            Assert.NotNull(authResult);
            Assert.NotEmpty(authResult.Token);
        }
        
        [Fact]
        public async Task Login_ShouldFail_WithWrongPassword()
        {
            var registerDto = new UserRegisterDto
            {
                Email = _testEmail,
                Password = _testPassword
            };
            await _client.PostAsJsonAsync("/api/auth/register", registerDto);

            var loginDto = new UserLoginDto
            {
                Email = _testEmail,
                Password = "WrongPassword!"
            };
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            Assert.Equal(HttpStatusCode.Unauthorized, loginResponse.StatusCode); 
        }
    }
}