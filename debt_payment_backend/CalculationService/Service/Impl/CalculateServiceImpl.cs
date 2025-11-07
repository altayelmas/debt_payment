using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using debt_payment_backend.CalculationService.Model.Dto;

namespace debt_payment_backend.CalculationService.Service.Impl
{
    public class CalculateServiceImpl : CalculateService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const int MAX_SIMULATION_MONTHS = 1200;
        public CalculateServiceImpl(IHttpClientFactory httpClientFactory, 
        IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<CalculationResultDto> CalculateAsync(CalculationRequestDto request, string userId)
        {
            var httpClient = _httpClientFactory.CreateClient("DebtServiceClient");

            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(token))
            {
                throw new UnauthorizedAccessException("Authorization token not found");
            }

            httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);

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
                return null;
            }

             var simulationDebts = userDebts.Select(dto => new DebtSimulationModel
            {
                Id = dto.DebtId,
                Name = dto.Name,
                CurrentBalance = dto.CurrentBalance,
                InterestRate = dto.InterestRate / 100,
                MinPayment = dto.MinPayment,
                OriginalBalance = dto.CurrentBalance
            }).ToList();

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

            return new CalculationResultDto
            {
                BeginningDebt = beginningDebt,
                SnowballResult = snowballResult,
                AvalancheResult = avalancheResult,
                Recommendation = recommendation
            };
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

            while (activeDebts.Any())
            {
                months++;

                if (months > MAX_SIMULATION_MONTHS)
                {
                    throw new InvalidOperationException(
                        "The calculation limit has been exceeded. Your payment plan does not cover the monthly interest " +
                        "or it takes more than 100 years. Please increase your payment amounts."
                    );
                }
                decimal monthlyNewInterest = 0;
                decimal extraPaymentSnowball = extraMonthlyPayment;

                foreach (var debt in activeDebts)
                {
                    decimal monthlyInterest = (debt.CurrentBalance * debt.InterestRate) / 12;
                    debt.CurrentBalance += monthlyInterest;
                    monthlyNewInterest += monthlyInterest;
                }
                totalInterestPaid += monthlyNewInterest;

                List<DebtSimulationModel> paidOffThisMonth = new List<DebtSimulationModel>();

                foreach (var debt in activeDebts)
                {
                    decimal payment = debt.MinPayment;

                    if (debt.CurrentBalance <= payment)
                    {
                        payment = debt.CurrentBalance;
                        debt.CurrentBalance = 0;
                        paidOffThisMonth.Add(debt);
                        extraPaymentSnowball += debt.MinPayment;
                    }
                    else
                    {
                        debt.CurrentBalance -= payment;
                    }
                }
                var orderedTargetDebts = strategyOrder(activeDebts.Where(d => d.CurrentBalance > 0).ToList());

                foreach (var targetDebt in orderedTargetDebts)
                {
                    if (extraPaymentSnowball <= 0) break;

                    if (targetDebt.CurrentBalance <= extraPaymentSnowball)
                    {
                        extraPaymentSnowball -= targetDebt.CurrentBalance;
                        targetDebt.CurrentBalance = 0;
                        paidOffThisMonth.Add(targetDebt);
                    }
                    else
                    {
                        targetDebt.CurrentBalance -= extraPaymentSnowball;
                        extraPaymentSnowball = 0;
                    }
                }
                activeDebts.RemoveAll(d => paidOffThisMonth.Contains(d));
            }
            var payoffDate = DateTime.Now.AddMonths(months);

            return new StrategyResultDto
            {
                StrategyName = strategyOrder.Method.Name,
                TotalInterestPaid = Math.Round(totalInterestPaid, 2),
                TotalMonths = months,
                TotalPaid = Math.Round(totalOriginalPayment + totalInterestPaid, 2),
                PayOffDate = $"{payoffDate.ToString("MMMM yyyy")} ({months} Months)"
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