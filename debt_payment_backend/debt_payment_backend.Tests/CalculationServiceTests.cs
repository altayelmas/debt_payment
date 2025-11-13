using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CalculationService.Repository;
using debt_payment_backend.CalculationService.Model.Dto;
using debt_payment_backend.CalculationService.Service.Impl;
using Microsoft.AspNetCore.Http;
using Moq;
using Moq.Protected;

namespace debt_payment_backend.Tests
{
    public class CalculationServiceTests
    {
        private readonly Mock<IHttpClientFactory> _mockFactory;
        private readonly Mock<IHttpContextAccessor> _mockContextAccessor;
        private readonly Mock<HttpMessageHandler> _mockHandler;
        private readonly HttpClient _httpClient;
        private readonly Mock<CalculationRepository> _mockRepository;

        private readonly CalculateServiceImpl _sut;

        public CalculationServiceTests()
        {
            _mockHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHandler.Object)
            {
                BaseAddress = new Uri("http://localhost:5002")
            };

            _mockFactory = new Mock<IHttpClientFactory>();
            _mockFactory.Setup(_ => _.CreateClient("DebtServiceClient"))
                        .Returns(_httpClient);

            _mockContextAccessor = new Mock<IHttpContextAccessor>();

            _mockRepository = new Mock<CalculationRepository>();

            _sut = new CalculateServiceImpl(
                _mockFactory.Object,
                _mockContextAccessor.Object,
                _mockRepository.Object
            );
        }

        private void SetupMockAuthToken(string token = "Bearer token-123")
        {
            var mockHttpContext = new Mock<HttpContext>();
            var mockHttpRequest = new Mock<HttpRequest>();
            var headers = new HeaderDictionary { { "Authorization", token } };

            mockHttpRequest.Setup(r => r.Headers).Returns(headers);
            mockHttpContext.Setup(c => c.Request).Returns(mockHttpRequest.Object);
            _mockContextAccessor.Setup(a => a.HttpContext).Returns(mockHttpContext.Object);
        }

        private void SetupMockHttpResponse(HttpStatusCode statusCode, object content)
        {
            var httpResponse = new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(JsonSerializer.Serialize(content), Encoding.UTF8, "application/json")
            };

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(httpResponse);
        }

        [Fact]
        public async Task CalculateAsync_ShouldThrowUnauthorizedAccessException_WhenTokenIsMissing()
        {
            var request = new CalculationRequestDto
            {
                ExtraMonthlyPayment = 500
            };

            _mockContextAccessor.Setup(a => a.HttpContext).Returns((HttpContext)null);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _sut.CalculateAsync(request, "user-id")
            );
        }

        [Fact]
        public async Task CalculateAsync_ShouldThrowInvalidOperationException_WhenHttpClientFails()
        {
            var request = new CalculationRequestDto
            {
                ExtraMonthlyPayment = 500
            };
            SetupMockAuthToken();

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ThrowsAsync(new HttpRequestException("Connection error"));


            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _sut.CalculateAsync(request, "user-id")
            );
            Assert.Equal("Couldn't reach Debt Service. Please try again later.", ex.Message);
        }

        [Fact]
        public async Task CalculateAsync_ShouldReturnNull_WhenNoDebtsAreFound()
        {
            var request = new CalculationRequestDto
            {
                ExtraMonthlyPayment = 500
            };
            SetupMockAuthToken();

            var emptyDebtList = new List<DebtDto>();
            SetupMockHttpResponse(HttpStatusCode.OK, emptyDebtList);

            var result = await _sut.CalculateAsync(request, "user-id");
            Assert.Null(result);
        }

        [Fact]
        public async Task CalculateAsync_ShouldThrowInvalidOperationException_WhenSimulationExceedsMaxMonths()
        {
            var request = new CalculationRequestDto { ExtraMonthlyPayment = 0 };
            SetupMockAuthToken();

            var impossibleDebt = new List<DebtDto>
            {
                new DebtDto { DebtId = 1, Name = "Impossible Debt", CurrentBalance = 10000, InterestRate = 20, MinPayment = 50 }
            };
            SetupMockHttpResponse(HttpStatusCode.OK, impossibleDebt);

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _sut.CalculateAsync(request, "user-id")
            );

            Assert.Contains("The calculation limit has been exceeded", ex.Message);
        }
        
        [Fact]
        public async Task CalculateAsync_ShouldReturnCorrectResult_WhenHappyPath()
        {
            var request = new CalculationRequestDto { ExtraMonthlyPayment = 100 };
            SetupMockAuthToken();

            var debts = new List<DebtDto>
            {
                new DebtDto { DebtId = 1, Name = "Debt 1", CurrentBalance = 1000, InterestRate = 20, MinPayment = 50 },
                new DebtDto { DebtId = 2, Name = "Debt 2", CurrentBalance = 500, InterestRate = 10, MinPayment = 25 }
            };
            SetupMockHttpResponse(HttpStatusCode.OK, debts);

            var result = await _sut.CalculateAsync(request, "user-id");

            Assert.NotNull(result);
            Assert.NotNull(result.SnowballResult);
            Assert.NotNull(result.AvalancheResult);
            
            Assert.Equal(1500, result.BeginningDebt);

            Assert.True(result.AvalancheResult.TotalInterestPaid < result.SnowballResult.TotalInterestPaid);

            Assert.Contains("Avalanche method", result.Recommendation);
            
            Assert.Equal("Snowball", result.SnowballResult.StrategyName);
            Assert.Equal("Avalanche", result.AvalancheResult.StrategyName);
        }
    }
}