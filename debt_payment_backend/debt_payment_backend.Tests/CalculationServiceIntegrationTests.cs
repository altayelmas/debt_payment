using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CalculationService.Data;
using CalculationService.Model.Entity;
using debt_payment_backend.CalculationService.Model.Dto;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Moq.Protected;

namespace debt_payment_backend.Tests
{
    public class CalculationServiceIntegrationTests : IClassFixture<CalculationServiceWebAppFactory>
    {
        private readonly HttpClient _client;
        private readonly CalculationServiceWebAppFactory _factory;

        public CalculationServiceIntegrationTests(CalculationServiceWebAppFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();

            _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue(TestAuthHandler.TestAuthScheme, "dummy-token");

            using (var scope = _factory.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.Database.EnsureDeleted();
                dbContext.Database.EnsureCreated();
            }
        }

        private void SetupMockDebtServiceResponse(List<DebtDto> debts, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var response = new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(JsonSerializer.Serialize(debts), Encoding.UTF8, "application/json")
            };

            _factory.MockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(response);
        }

        [Fact]
        public async Task Calculate_ShouldReturnReportId_WhenSuccessful()
        {
            var debts = new List<DebtDto>
            {
                new DebtDto { DebtId = 1, Name = "Debt 1", CurrentBalance = 5000, InterestRate = 10, MinPayment = 100 }
            };
            SetupMockDebtServiceResponse(debts);

            var request = new CalculationRequestDto { ExtraMonthlyPayment = 200 };

            var response = await _client.PostAsJsonAsync("/api/Calculation/calculate", request);

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(result.TryGetProperty("reportId", out var reportIdElement));
            Assert.True(Guid.TryParse(reportIdElement.GetString(), out _));
        }

        [Fact]
        public async Task GetReportById_ShouldReturnReport_WhenExists()
        {
            
            var reportId = Guid.NewGuid();
            var reportData = new CalculationResultDto { BeginningDebt = 1000 };
            var report = new CalculationReport
            {
                CalculationId = reportId,
                UserId = TestAuthHandler.TestUserId,
                CreatedAt = DateTime.UtcNow,
                ReportDataJson = JsonSerializer.Serialize(reportData),
                ScenarioHash = "test-hash"
            };

            using (var scope = _factory.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.CalculationReports.Add(report);
                await dbContext.SaveChangesAsync();
            }

            var response = await _client.GetAsync($"/api/Calculation/{reportId}");

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<CalculationResultDto>();
            Assert.NotNull(result);
            Assert.Equal(1000, result.BeginningDebt);
        }

        [Fact]
        public async Task GetHistory_ShouldReturnUserHistory()
        {
            var debts = new List<DebtDto> { new DebtDto { DebtId = 2, Name = "Debt 2", CurrentBalance = 2000, InterestRate = 5, MinPayment = 50 } };
            SetupMockDebtServiceResponse(debts);
            var calculateResponse = await _client.PostAsJsonAsync("/api/Calculation/calculate", new CalculationRequestDto { ExtraMonthlyPayment = 100 });

            calculateResponse.EnsureSuccessStatusCode();

            var response = await _client.GetAsync("/api/Calculation/history");

            response.EnsureSuccessStatusCode();
            var history = await response.Content.ReadFromJsonAsync<List<CalculationHistoryDto>>();
            Assert.NotNull(history);
            Assert.Single(history);
            Assert.Equal(2000, history.First().TotalDebt);
        }
    }
}