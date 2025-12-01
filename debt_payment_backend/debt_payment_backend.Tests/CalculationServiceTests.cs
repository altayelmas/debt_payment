using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CalculationService.Exceptions;
using CalculationService.Model.Entity;
using CalculationService.Repository;
using debt_payment_backend.CalculationService.Model.Dto;
using debt_payment_backend.CalculationService.Service.Impl;
using MassTransit;
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
        private readonly Mock<CalculationRepository> _mockRepository;
        private readonly Mock<IPublishEndpoint> _mockPublishEndpoint;

        private readonly CalculateServiceImpl _sut;

        public CalculationServiceTests()
        {
            _mockHandler = new Mock<HttpMessageHandler>();
            _mockFactory = new Mock<IHttpClientFactory>();
            _mockFactory.Setup(_ => _.CreateClient("DebtServiceClient"))
                        .Returns(new HttpClient(_mockHandler.Object) { BaseAddress = new Uri("http://testhost/") });

            _mockContextAccessor = new Mock<IHttpContextAccessor>();

            _mockRepository = new Mock<CalculationRepository>();
            _mockPublishEndpoint = new Mock<IPublishEndpoint>();

            _sut = new CalculateServiceImpl(
                _mockFactory.Object,
                _mockContextAccessor.Object,
                _mockRepository.Object,
                _mockPublishEndpoint.Object
            );
        }

        private void SetupMockAuthToken(string token = "Bearer token-123")
        {
            var mockHttpContext = new Mock<HttpContext>();
            var mockHttpRequest = new Mock<HttpRequest>();
            var headers = new HeaderDictionary { { "Authorization", token } };

            mockHttpRequest.Setup(r => r.Headers).Returns(headers);
            mockHttpContext.Setup(c => c.Request).Returns(mockHttpRequest.Object);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, "test@user.com"),
                new Claim("email", "test@user.com")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            mockHttpContext.Setup(c => c.User).Returns(claimsPrincipal);
            
            _mockContextAccessor.Setup(a => a.HttpContext).Returns(mockHttpContext.Object);
        }

        private void SetupMockHttpResponse<T>(T content, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var httpResponse = new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(JsonSerializer.Serialize(content), Encoding.UTF8, "application/json"),
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
        public async Task CalculateAsync_Should_ThrowUnauthorizedAccessException_When_TokenIsMissing()
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
        public async Task CalculateAsync_Should_ThrowInvalidOperationException_When_DebtServiceCallFails()
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
        public async Task CalculateAsync_Should_ThrowInvalidOperationException_When_NoDebtsAreFound()
        {
            var request = new CalculationRequestDto
            {
                ExtraMonthlyPayment = 500
            };
            SetupMockAuthToken();
            var emptyDebtList = new List<DebtDto>();
            SetupMockHttpResponse(emptyDebtList);

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _sut.CalculateAsync(request, "user-id")
            );

            Assert.Equal("No debts found to calculate.", ex.Message);
        }

        [Fact]
        public async Task CalculateAsync_Should_ThrowInvalidOperationException_When_SimulationExceedsMaxMonths()
        {
            var request = new CalculationRequestDto { ExtraMonthlyPayment = 0 };
            SetupMockAuthToken();

            var impossibleDebt = new List<DebtDto>
            {
                new DebtDto { DebtId = 1, Name = "Impossible Debt", CurrentBalance = 10000, InterestRate = 20, MinPayment = 50 }
            };
            SetupMockHttpResponse(impossibleDebt);

            var ex = await Assert.ThrowsAsync<PaymentInsufficientException>(() =>
                _sut.CalculateAsync(request, "user-id")
            );

            Assert.Contains("Payment insufficient.", ex.Message);
            Assert.True(ex.DeficitAmount - 216.66m < 0.01m);
        }
        
        [Fact]
        public async Task CalculateAsync_Should_ReturnExistingReportId_When_ScenarioHashMatches()
        {
            var request = new CalculationRequestDto { ExtraMonthlyPayment = 100 };
            var userId = "user-id";
            SetupMockAuthToken();

            var debts = new List<DebtDto>
            {
                new DebtDto { DebtId = 1, Name = "Debt 1", CurrentBalance = 1000, InterestRate = 10, MinPayment = 50 }
            };
            SetupMockHttpResponse(debts);

            var existingReport = new CalculationReport { CalculationId = Guid.NewGuid(), UserId = userId };
            _mockRepository.Setup(r => r.GetReportByHashAsync(It.IsAny<string>())).ReturnsAsync(existingReport);

            var resultId = await _sut.CalculateAsync(request, userId);

            Assert.Equal(existingReport.CalculationId, resultId);
            _mockRepository.Verify(r => r.AddCalculationReportAsync(It.IsAny<CalculationReport>()), Times.Never);
        }

        [Fact]
        public async Task CalculateAsync_Should_CreateAndReturnNewReportId_When_HappyPath()
        {
            var request = new CalculationRequestDto { ExtraMonthlyPayment = 100 };
            SetupMockAuthToken();

            var debts = new List<DebtDto>
            {
                new DebtDto { DebtId = 1, Name = "Debt 1", CurrentBalance = 1000, InterestRate = 20, MinPayment = 50 },
                new DebtDto { DebtId = 2, Name = "Debt 2", CurrentBalance = 500, InterestRate = 10, MinPayment = 25 }
            };
            SetupMockHttpResponse(debts);

            _mockRepository.Setup(r => r.GetReportByHashAsync(It.IsAny<string>())).ReturnsAsync((CalculationReport)null);

            var newReportId = await _sut.CalculateAsync(request, "user-id");

            Assert.NotEqual(Guid.Empty, newReportId);

            _mockRepository.Verify(r => r.AddCalculationReportAsync(It.Is<CalculationReport>(report =>
                report.CalculationId == newReportId &&
                report.UserId == "user-id" &&
                !string.IsNullOrEmpty(report.ReportDataJson) &&
                !string.IsNullOrEmpty(report.ScenarioHash)
            )), Times.Once);
            _mockRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task GetCalculationHistory_ShouldReturnEmptyList_WhenNoReportsExist()
        {
            var userId = "user-id";
            _mockRepository.Setup(r => r.GetCalculationsByUserId(userId)).ReturnsAsync(new List<CalculationReport>());

            var result = await _sut.GetCalculationHistory(userId);

            Assert.Empty(result);
            _mockRepository.Verify(r => r.GetCalculationsByUserId(userId), Times.Once);
        }

    }
}