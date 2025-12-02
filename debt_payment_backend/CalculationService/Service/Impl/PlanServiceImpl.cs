using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Dto;
using CalculationService.Model.Entity;
using CalculationService.Repository;
using debt_payment_backend.CalculationService.Model.Dto;
using debt_payment_backend.CalculationService.Service;

namespace CalculationService.Service.Impl
{
    public class PlanServiceImpl : PlanService
    {
        private readonly PlanRepository _planRepository;
        private readonly CalculateService _calculateService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public PlanServiceImpl(PlanRepository planRepository, 
            CalculateService calculateService,
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor)
        {
            _planRepository = planRepository;
            _calculateService = calculateService;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
        }
       
        public async Task<bool> ActivatePlanAsync(string userId, Guid reportId, String strategy)
        {
            var reportExists = await _calculateService.GetCalculationResultById(userId, reportId);
            if (reportExists == null) return false;

            if (strategy != "Avalanche" && strategy != "Snowball") return false;

            var oldPlans = await _planRepository.GetActivePlansByUserIdAsync(userId);
            if (oldPlans != null) foreach (var p in oldPlans) p.IsActive = false;

            var newPlan = new UserActivePlan
            {
                UserId = userId,
                CalculationReportId = reportId,
                IsActive = true,
                SelectedStrategy = strategy
            };

            await _planRepository.AddUserActivePlanAsync(newPlan);
            await _planRepository.SaveChangesAsync();

            return true;
        }

        public async Task<CalculationResultDto?> GetActivePlanAsync(string userId)
        {
            var activePlan = await _planRepository.GetActivePlanByUserIdAsync(userId);
            if (activePlan == null) return null;

            var report = await _calculateService.GetCalculationResultById(userId, activePlan.CalculationReportId);
            if (report == null) return null;

            var actualPayments = new List<ActualPaymentDto>();
            
            try
            {
                var client = _httpClientFactory.CreateClient("DebtServiceClient");
                
                var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (!string.IsNullOrEmpty(token))
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }
                var reportId = activePlan.CalculationReportId;
                actualPayments = await client.GetFromJsonAsync<List<ActualPaymentDto>>($"api/Payment/history?reportId={reportId}") ?? new();            
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DebtService Error: {ex.Message}");
            }

            var targetSchedule = activePlan.SelectedStrategy == "Avalanche"
                ? report.AvalancheResult.PaymentSchedule 
                : report.SnowballResult.PaymentSchedule;

            var cultures = new[] { CultureInfo.GetCultureInfo("en-US"), CultureInfo.GetCultureInfo("tr-TR") };

            foreach (var monthPlan in targetSchedule)
            {
                DateTime planDate = DateTime.MinValue;
                bool parsed = false;

                foreach (var culture in cultures)
                {
                    if (DateTime.TryParseExact(monthPlan.MonthYear, "MMMM yyyy", culture, DateTimeStyles.None, out planDate))
                    {
                        parsed = true;
                        break;
                    }
                }

                if (parsed)
                {
                    var paymentsInMonth = actualPayments
                        .Where(p => p.PaymentDate.Year == planDate.Year && p.PaymentDate.Month == planDate.Month)
                        .ToList();

                    if (paymentsInMonth.Any())
                    {
                        var totalPaidInMonth = paymentsInMonth.Sum(p => p.Amount);
                        
                        monthPlan.ActualPaidAmount = totalPaidInMonth;
                        monthPlan.PaymentDate = paymentsInMonth.Max(p => p.PaymentDate);

                        if (totalPaidInMonth >= (monthPlan.TotalPaymentAmount * 0.99m))
                        {
                            monthPlan.IsPaid = true;
                        }
                        else 
                        {
                            monthPlan.IsPaid = false; 
                        }
                    }
                }
            }

            var nextUnpaidMonth = targetSchedule.FirstOrDefault(m => !m.IsPaid);

            decimal validRangeStart;
            decimal validRangeEnd;

            if (nextUnpaidMonth != null)
            {
                var index = targetSchedule.IndexOf(nextUnpaidMonth);

                if (index == 0)
                {
                    validRangeStart = report.BeginningDebt;
                }
                else
                {
                    validRangeStart = targetSchedule[index - 1].EndingBalance;
                }

                validRangeEnd = nextUnpaidMonth.EndingBalance;
            }
            else
            {
                validRangeStart = targetSchedule.Last().EndingBalance;
                validRangeEnd = 0;
            }

            report.CurrentTotalDebt = validRangeStart; 

            try
            {
                var client = _httpClientFactory.CreateClient("DebtServiceClient");
                var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (!string.IsNullOrEmpty(token))
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }
            
                var currentDebts = await client.GetFromJsonAsync<List<DebtDto>>("api/Debt/internal/all-for-user") ?? new List<DebtDto>();
                var realCurrentDebt = currentDebts.Sum(d => d.CurrentBalance);

                report.CurrentTotalDebt = realCurrentDebt;
                
                report.IsPlanOutdated = false;
                
                var originalDebts = report.DebtStatuses ?? new List<ActiveDebtStatusDto>();

                report.DebtStatuses = new List<ActiveDebtStatusDto>();

                foreach (var initialDebt in originalDebts)
                {
                    var liveDebt = currentDebts.FirstOrDefault(d => d.DebtId == initialDebt.DebtId);

                    report.DebtStatuses.Add(new ActiveDebtStatusDto
                    {
                        DebtName = initialDebt.DebtName,
                        DebtId = initialDebt.DebtId,
                        StartingBalance = initialDebt.StartingBalance, 
                        CurrentBalance = liveDebt?.CurrentBalance ?? 0 
                    });
                    report.CurrentTotalDebt = realCurrentDebt;
                
                }
                report.CurrentTotalDebt = realCurrentDebt;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Health Check Error: {ex.Message}");
                report.IsPlanOutdated = false;
            }
            report.SelectedStrategy = activePlan.SelectedStrategy;
            return report;
        }

        public async  Task<Guid?> RecalculateActivePlanAsync(string userId)
        {
            var activePlan = await _planRepository.GetActivePlanByUserIdAsync(userId);
            if (activePlan == null) return null;

            var oldReport = await _calculateService.GetCalculationResultById(userId, activePlan.CalculationReportId);
            if (oldReport == null) return null;

            var newReportId = await _calculateService.CalculateAsync(
                new CalculationRequestDto { ExtraMonthlyPayment = oldReport.ExtraPayment }, 
                userId
            );

            activePlan.CalculationReportId = newReportId;
            activePlan.ActivatedAt = DateTime.UtcNow; 
            
            await _planRepository.UpdateUserActivePlanAsync(activePlan);

            return newReportId;
        }
    }
}