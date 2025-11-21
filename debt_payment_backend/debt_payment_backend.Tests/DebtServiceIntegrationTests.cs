using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Data;
using debt_payment_backend.DebtService.Model.Dto;
using debt_payment_backend.DebtService.Model.Entity;
using DebtService.Model.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace debt_payment_backend.Tests
{
    public class DebtServiceIntegrationTests : IClassFixture<DebtServiceWebAppFactory>
    {
        private readonly HttpClient _client;
        private readonly DebtServiceWebAppFactory _factory;

        public DebtServiceIntegrationTests(DebtServiceWebAppFactory factory)
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
        public async Task Debt_CRUD_Operations_ShouldWork_Sequentially()
        {
            var newDebtDto = new DebtCreateUpdateDto
            {
                Name = "CRUD Test",
                CurrentBalance = 1000,
                InterestRate = 10,
                MinPayment = 50
            };
            var postResponse = await _client.PostAsJsonAsync("/api/Debt", newDebtDto);
            postResponse.EnsureSuccessStatusCode();
            var createdDebt = await postResponse.Content.ReadFromJsonAsync<DebtDto>();

            Assert.NotNull(createdDebt);
            Assert.Equal("CRUD Test", createdDebt.Name);
            int newDebtId = createdDebt.DebtId;

            var getResponse = await _client.GetAsync($"/api/Debt");
            getResponse.EnsureSuccessStatusCode();
            var fetchedReponse = await getResponse.Content.ReadFromJsonAsync<PaginationDtos<DebtDto>>();

            Assert.NotNull(fetchedReponse);
            var fetchedDebt = fetchedReponse.Items.FirstOrDefault(d => d.DebtId == newDebtId);
            Assert.NotNull(fetchedDebt);

            Assert.Equal(1000, fetchedDebt.CurrentBalance);
            Assert.Equal(newDebtId, fetchedDebt.DebtId);

            var updateDto = new DebtCreateUpdateDto
            {
                Name = "CRUD Test Updated",
                CurrentBalance = 1500,
                InterestRate = 10,
                MinPayment = 50
            };
            var putResponse = await _client.PutAsJsonAsync($"/api/Debt/{newDebtId}", updateDto);
            putResponse.EnsureSuccessStatusCode();

            var updatedGetResponse = await _client.GetAsync($"/api/Debt/{newDebtId}");
            var updatedDebt = await updatedGetResponse.Content.ReadFromJsonAsync<DebtDto>();
            Assert.NotNull(updatedDebt);
            Assert.Equal(1500, updatedDebt.CurrentBalance);
            Assert.Equal("CRUD Test Updated", updatedDebt.Name);

            var deleteResponse = await _client.DeleteAsync($"/api/Debt/{newDebtId}");
            deleteResponse.EnsureSuccessStatusCode();

            var finalGetResponse = await _client.GetAsync($"/api/Debt/{newDebtId}");
            Assert.Equal(HttpStatusCode.NotFound, finalGetResponse.StatusCode);
        }
        
        
        [Fact]
        public async Task GetDebts_ShouldReturnPagedResult()
        {
            
             var debt1 = new DebtCreateUpdateDto { Name = "Page Test 1", CurrentBalance = 100, InterestRate = 10, MinPayment = 10 };
             var debt2 = new DebtCreateUpdateDto { Name = "Page Test 2", CurrentBalance = 200, InterestRate = 10, MinPayment = 10 };
             await _client.PostAsJsonAsync("/api/Debt", debt1);
             await _client.PostAsJsonAsync("/api/Debt", debt2);

            var getResponse = await _client.GetAsync("/api/Debt?pageNumber=1&pageSize=5");

            getResponse.EnsureSuccessStatusCode();
            var pagedResult = await getResponse.Content.ReadFromJsonAsync<PaginationDtos<DebtDto>>();
            
            Assert.NotNull(pagedResult);
            Assert.True(pagedResult.TotalCount >= 2); 
            Assert.Contains(pagedResult.Items, d => d.Name == "Page Test 1");
        }

        [Fact]
        public async Task DebtEndpoints_ShouldWorkCorrectly_WhenCreatingAndGettingDebts()
        {
            var newDebtDto = new DebtCreateUpdateDto
            {
                Name = "Integration Test",
                CurrentBalance = 5000,
                InterestRate = 15,
                MinPayment = 100
            };

            var postResponse = await _client.PostAsJsonAsync("/api/Debt", newDebtDto);

            postResponse.EnsureSuccessStatusCode();
            var createdDebt = await postResponse.Content.ReadFromJsonAsync<DebtDto>();
            Assert.NotNull(createdDebt);
            Assert.Equal("Integration Test", createdDebt.Name);

            var getResponse = await _client.GetAsync("/api/Debt?page=1&pageSize=10");

            getResponse.EnsureSuccessStatusCode();
            var pagedResult = await getResponse.Content.ReadFromJsonAsync<PaginationDtos<DebtDto>>();

            Assert.NotNull(pagedResult);
            Assert.Equal(1, pagedResult.TotalCount);
            Assert.Equal("Integration Test", pagedResult.Items.First().Name);

            using (var scope = _factory.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var debtInDb = await dbContext.Debts
                    .FirstOrDefaultAsync(d => d.Name == "Integration Test");

                Assert.NotNull(debtInDb);
                Assert.Equal(5000, debtInDb.CurrentBalance);

                Assert.Equal(TestAuthHandler.TestUserId, debtInDb.UserId);
            }
        }
    }
}