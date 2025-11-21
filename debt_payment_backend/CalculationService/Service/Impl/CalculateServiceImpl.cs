using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CalculationService.Model.Dto;
using CalculationService.Model.Entity;
using CalculationService.Repository;
using debt_payment_backend.CalculationService.Document;
using debt_payment_backend.CalculationService.Model.Dto;
using DebtPayment.Shared.Events;
using MassTransit;
using QuestPDF.Fluent;

namespace debt_payment_backend.CalculationService.Service.Impl
{
    public class CalculateServiceImpl : CalculateService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly CalculationRepository _calculationRepository;
        private readonly IPublishEndpoint _publishEndpoint;
        private const int MAX_SIMULATION_MONTHS = 1200;
        public CalculateServiceImpl(IHttpClientFactory httpClientFactory,
        IHttpContextAccessor httpContextAccessor, 
        CalculationRepository calculationRepository,
        IPublishEndpoint publishEndpoint)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _calculationRepository = calculationRepository;
            _publishEndpoint = publishEndpoint;
        }
        public async Task<Guid> CalculateAsync(CalculationRequestDto request, string userId)
        {
            var httpClient = _httpClientFactory.CreateClient("DebtServiceClient");

            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(token))
            {
                throw new UnauthorizedAccessException("Authorization token not found");
            }

            httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);

            var userEmail = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value 
                    ?? _httpContextAccessor.HttpContext?.User.FindFirst("email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                userEmail = "email-not-found-in-token@example.com";
                Console.WriteLine("Warning: Couldn't find email claim in token. Using placeholder email.");
            }

            List<DebtDto>? userDebts;

            try
            {
                userDebts = await httpClient.GetFromJsonAsync<List<DebtDto>>("api/Debt/internal/all-for-user");
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"DebtService Connection error: {ex.Message}");
                throw new InvalidOperationException("Couldn't reach Debt Service. Please try again later.");
            }

            if (userDebts == null || !userDebts.Any())
            {
                throw new InvalidOperationException("No debts found to calculate.");
            }
            string scenarioHash = CreateScenarioHash(userId, request.ExtraMonthlyPayment, userDebts);
            var existingReport = await _calculationRepository.GetReportByHashAsync(scenarioHash);

            if (existingReport != null)
            {
                existingReport.CreatedAt = DateTime.UtcNow;
                await _calculationRepository.UpdateReport(existingReport);
                await _calculationRepository.SaveChangesAsync();
                return existingReport.CalculationId;
            }

            var snowballResult = SimulatePayment(userDebts, request.ExtraMonthlyPayment, OrderForSnowball);
            var avalancheResult = SimulatePayment(userDebts, request.ExtraMonthlyPayment, OrderForAvalanche);

            snowballResult.StrategyName = "Snowball";
            avalancheResult.StrategyName = "Avalanche";

            var trCulture = new CultureInfo("tr-TR");

            var difference = Math.Round(snowballResult.TotalInterestPaid - avalancheResult.TotalInterestPaid, 2);
            string recommendation;

            if (difference <= 0)
            {
                string formattedAmount = Math.Abs(difference).ToString("C2", trCulture);
                recommendation = $"You can save a total of {formattedAmount} in interest using the Snowball method.";
            }
            else
            {
                string formattedAmount = difference.ToString("C2", trCulture);
                recommendation = $"You can save a total of {formattedAmount} in interest using the Avalanche method.";
            }

            decimal beginningDebt = 0;
            foreach (var debt in userDebts)
            {
                beginningDebt += debt.CurrentBalance;
            }

            var resultDto = new CalculationResultDto
            {
                BeginningDebt = beginningDebt,
                SnowballResult = snowballResult,
                AvalancheResult = avalancheResult,
                Recommendation = recommendation,
                ExtraPayment = request.ExtraMonthlyPayment
            };

            var report = new CalculationReport
            {
                CalculationId = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                ReportDataJson = JsonSerializer.Serialize(resultDto),
                ScenarioHash = scenarioHash
            };

            await _calculationRepository.AddCalculationReportAsync(report);
            await _calculationRepository.SaveChangesAsync();

            await _publishEndpoint.Publish(new CalculationCreatedEvent
            {
                ReportId = report.CalculationId,
                UserId = userId,
                Email = userEmail, 
                TotalDebt = resultDto.BeginningDebt,
                CreatedAt = DateTime.UtcNow
            });
            
            return report.CalculationId;
        }

        private string CreateScenarioHash(string userId, decimal extraPayment, List<DebtDto> debts)
        {
            var orderedDebts = debts.OrderBy(d => d.DebtId);
            
            var signatureBuilder = new StringBuilder();
            signatureBuilder.Append($"USER:{userId};");
            signatureBuilder.Append($"EXTRA:{extraPayment.ToString("G")};");
            
            foreach (var debt in orderedDebts)
            {
                signatureBuilder.Append($"DEBT:{debt.CurrentBalance.ToString("G")}:{debt.InterestRate.ToString("G")}:{debt.MinPayment.ToString("G")}|");
            }

            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(signatureBuilder.ToString());
            var hashBytes = sha256.ComputeHash(bytes);
            
            return Convert.ToBase64String(hashBytes);
        }

        private StrategyResultDto SimulatePayment(List<DebtDto> userDebts,
            decimal extraMonthlyPayment,
            Func<List<DebtSimulationModel>, IOrderedEnumerable<DebtSimulationModel>> strategyOrder)
        {
            var activeDebts = userDebts.Select(d => new DebtSimulationModel
            {
                Id = d.DebtId,
                Name = d.Name,
                CurrentBalance = d.CurrentBalance,
                InterestRate = d.InterestRate / 100,
                MinPayment = d.MinPayment,
                OriginalBalance = d.CurrentBalance
            }).ToList();

            decimal totalInterestPaid = 0;
            int months = 0;
            decimal totalOriginalPayment = activeDebts.Sum(d => d.OriginalBalance);

            decimal initialTotalMinPayment = activeDebts.Sum(d => d.MinPayment);
            decimal monthlyTotalBudget = initialTotalMinPayment + extraMonthlyPayment;

            var paymentSchedule = new List<MonthlyPaymentDetailDto>();
            var milestones = new List<DebtPayoffMilestoneDto>();

            while (activeDebts.Any())
            {
                months++;

                if (months > MAX_SIMULATION_MONTHS)
                {
                    throw new InvalidOperationException(
                        "The calculation limit has been exceeded."
                    );
                }

                decimal monthBeginningBalance = activeDebts.Sum(d => d.CurrentBalance);
                decimal monthlyNewInterest = 0;

                foreach (var debt in activeDebts)
                {
                    decimal monthlyInterest = (debt.CurrentBalance * debt.InterestRate) / 12;
                    debt.CurrentBalance += monthlyInterest;
                    monthlyNewInterest += monthlyInterest;
                }

                totalInterestPaid += monthlyNewInterest;
                List<DebtSimulationModel> paidOffThisMonth = new List<DebtSimulationModel>();

                decimal moneySpentOnMinPayments = 0;

                foreach (var debt in activeDebts)
                {
                    decimal payment = debt.MinPayment;

                    if (debt.CurrentBalance < payment)
                    {
                        payment = debt.CurrentBalance;
                    }

                    debt.CurrentBalance -= payment;
                    moneySpentOnMinPayments += payment;
                    if (debt.CurrentBalance <= 0)
                    {
                        debt.CurrentBalance = 0;
                        if(!paidOffThisMonth.Contains(debt)) paidOffThisMonth.Add(debt);
                    }
                }

                decimal availableForSnowball = monthlyTotalBudget - moneySpentOnMinPayments;

                if (availableForSnowball > 0)
                {
                    var orderedTargetDebts = strategyOrder(activeDebts.Where(d => d.CurrentBalance > 0).ToList());

                    foreach (var targetDebt in orderedTargetDebts)
                    {
                        if (availableForSnowball <= 0) break;

                        if (targetDebt.CurrentBalance <= availableForSnowball)
                        {
                            availableForSnowball -= targetDebt.CurrentBalance;
                            targetDebt.CurrentBalance = 0;
                            if (!paidOffThisMonth.Contains(targetDebt)) paidOffThisMonth.Add(targetDebt);
                        }
                        else
                        {
                            targetDebt.CurrentBalance -= availableForSnowball;
                            availableForSnowball = 0;
                        }
                    }
                }
               
                activeDebts.RemoveAll(d => d.CurrentBalance <= 0);
                decimal monthEndingBalance = activeDebts.Sum(d => d.CurrentBalance);
                decimal totalPaidThisMonth = monthlyTotalBudget - availableForSnowball;

                decimal principalPaid = totalPaidThisMonth - monthlyNewInterest;
                var currentMonthDate = DateTime.Now.AddMonths(months);
                //Console.WriteLine($"[Month {months}] Debts paid off this month: {paidOffThisMonth.Count}");

                if (paidOffThisMonth.Any())
                {
                    foreach (var paidDebt in paidOffThisMonth.Distinct())
                    {
                        milestones.Add(new DebtPayoffMilestoneDto
                        {
                            Month = months,
                            MonthYear = currentMonthDate.ToString("MMMM yyyy"),
                            DebtName = paidDebt.Name
                        });
                    }
                }

                paymentSchedule.Add(new MonthlyPaymentDetailDto
                {
                    Month = months,
                    MonthYear = currentMonthDate.ToString("MMMM yyyy"),
                    InterestPaid = Math.Round(monthlyNewInterest, 2),
                    PrincipalPaid = Math.Round(principalPaid, 2),                  
                    TotalPaymentAmount = Math.Round(totalPaidThisMonth, 2),
                    MonthlyNote = "",
                    EndingBalance = Math.Round(monthEndingBalance, 2),
                    PaidOffDebts = paidOffThisMonth.Select(d => d.Name).ToList()
                });
            }
            var payoffDate = DateTime.Now.AddMonths(months);

            return new StrategyResultDto
            {
                StrategyName = strategyOrder.Method.Name,
                TotalInterestPaid = Math.Round(totalInterestPaid, 2),
                TotalMonths = months,
                TotalPaid = Math.Round(totalOriginalPayment + totalInterestPaid, 2),
                PayOffDate = $"{payoffDate.ToString("MMMM yyyy")} ({months} Months)",
                PaymentSchedule = paymentSchedule,
                Milestones = milestones
            };
        }

        private IOrderedEnumerable<DebtSimulationModel> OrderForSnowball(List<DebtSimulationModel> debts)
        {
            return debts.OrderBy(d => d.CurrentBalance);
        }
        private IOrderedEnumerable<DebtSimulationModel> OrderForAvalanche(List<DebtSimulationModel> debts)
        {
            return debts.OrderByDescending(d => d.InterestRate);
        }

        public async Task<CalculationResultDto> GetCalculationResultById(string userId, Guid reportId)
        {
            var calculationReport = await _calculationRepository.GetCalculationReportByIdAndUserIdAsync(userId, reportId);
            if (calculationReport == null)
            {
                return null;
            }

            var reportData = JsonSerializer.Deserialize<CalculationResultDto>(calculationReport.ReportDataJson);

            return reportData;
        }

        public async Task<List<CalculationHistoryDto>> GetCalculationHistory(string userId)
        {
            var reports = await _calculationRepository.GetCalculationsByUserId(userId);
            var historyList = new List<CalculationHistoryDto>();

            foreach (var report in reports)
            {
                var reportData = JsonSerializer.Deserialize<CalculationResultDto>(report.ReportDataJson);
                if (reportData == null) continue;

                var recommendedResult = reportData.Recommendation.Contains("Avalanche")
                    ? reportData.AvalancheResult
                    : reportData.SnowballResult;

                var savedInterest = Math.Abs(reportData.SnowballResult.TotalInterestPaid - reportData.AvalancheResult.TotalInterestPaid);

                historyList.Add(new CalculationHistoryDto
                {
                    ReportId = report.CalculationId,
                    CreatedAt = report.CreatedAt,
                    TotalDebt = reportData.BeginningDebt,
                    ExtraPayment = reportData.ExtraPayment,
                    RecommendedPayOffDate = recommendedResult.PayOffDate,
                    RecommendedInterestSaved = savedInterest
                });
            }
            return historyList;
        }

        public async Task<bool> DeleteCalculationById(string userId, Guid reportId)
        {
            var report = await _calculationRepository.GetCalculationReportByIdAndUserIdAsync(userId, reportId);
            if (report == null)
            {
                return false;
            }
            await _calculationRepository.DeleteCalculationReportAsync(report);
            await _calculationRepository.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]?> GeneratePdfReportAsync(string userId, Guid reportId, string strategy, string languageCode = "en")
        {
            var calculationReport = await _calculationRepository.GetCalculationReportByIdAndUserIdAsync(userId, reportId);
            if (calculationReport == null) return null;

            var reportData = JsonSerializer.Deserialize<CalculationResultDto>(calculationReport.ReportDataJson);
            if (reportData == null) return null;

            var document = new CalculationReportDocument(reportData, strategy, languageCode);
            var pdfBytes = document.GeneratePdf();
            return pdfBytes; 
        }

        public class DebtSimulationModel
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public decimal CurrentBalance { get; set; }
            public decimal InterestRate { get; set; }
            public decimal MinPayment { get; set; }
            public decimal OriginalBalance { get; set; }
        }
    }
}