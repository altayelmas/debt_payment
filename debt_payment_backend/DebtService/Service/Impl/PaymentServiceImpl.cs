using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Entity;
using debt_payment_backend.DebtService.Repository;
using DebtService.Model.Dto;
using DebtService.Model.Entity;
using DebtService.Repository;

namespace DebtService.Service.Impl
{
    public class PaymentServiceImpl : PaymentService
    {
        private readonly PaymentRepository _paymentRepository;
        private readonly DebtRepository _debtRepository;
        public PaymentServiceImpl(PaymentRepository paymentRepository, DebtRepository debtRepository)
        {
            _paymentRepository = paymentRepository;
            _debtRepository = debtRepository;
        }

        public async Task<bool> AddBulkPaymentAsync(List<PaymentDto> payments, string userId)
        {
            return await _paymentRepository.AddBulkPaymentsAsync(payments, userId);
        }

        public async Task<bool> AddPaymentAsync(PaymentDto paymentDto, string userId)
        {
            var debt = await _debtRepository.GetDebtByIdAndUserIdAsync(paymentDto.DebtId, userId);
            if (debt == null) return false;

            var payment = new ActualPayment
            {
                DebtId = paymentDto.DebtId,
                Amount = paymentDto.Amount,
                PaymentDate = paymentDto.Date,
                CalculationReportId = paymentDto.CalculationReportId
            };
            await _paymentRepository.AddPaymentAsync(payment);
            await _paymentRepository.SaveChangesAsync();

            debt.CurrentBalance -= paymentDto.Amount;
            if (debt.CurrentBalance < 0) debt.CurrentBalance = 0;
            await _debtRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DistributeAndPayAsync(decimal totalAmount, 
            string userId, string strategy = "Avalanche", 
            DateTime? date = null, 
            Guid? reportId = null)
        {
            var debts = await _debtRepository.GetActiveDebtsByUserIdAsync(userId);
            if (debts == null || !debts.Any()) return false;

            var simulatedBalances = debts.ToDictionary(d => d.DebtId, d => d.CurrentBalance);

            var targetDate = date ?? DateTime.UtcNow;
            var existingPayments = await _paymentRepository.GetUserPaymentsAsync(userId, reportId);

            decimal remainingMoney = totalAmount;
            var paymentsToMake = new List<PaymentDto>();

            foreach (var debt in debts)
            {
                if (remainingMoney > 0)
                {
                    var paidSoFarThisMonth = existingPayments
                        .Where(p => p.DebtId == debt.DebtId &&
                                    p.PaymentDate.Year == targetDate.Year &&
                                    p.PaymentDate.Month == targetDate.Month)
                        .Sum(p => p.Amount);

                    decimal remainingMinPayment = debt.MinPayment - paidSoFarThisMonth;
                    if (remainingMinPayment < 0) remainingMinPayment = 0;

                    decimal paymentAmount = Math.Min(remainingMinPayment, simulatedBalances[debt.DebtId]);
                    paymentAmount = Math.Min(paymentAmount, remainingMoney);

                    if (paymentAmount > 0)
                    {
                        paymentsToMake.Add(new PaymentDto
                        {
                            DebtId = debt.DebtId,
                            Amount = paymentAmount,
                            Date = targetDate,
                            CalculationReportId = reportId ?? Guid.Empty
                        });

                        simulatedBalances[debt.DebtId] -= paymentAmount;
                        remainingMoney -= paymentAmount;
                    }
                }
            }

            while (remainingMoney > 0)
            {
                var isSnowball = string.Equals(strategy, "Snowball", StringComparison.OrdinalIgnoreCase);
                
                var targetDebt = isSnowball
                    ? debts.Where(d => simulatedBalances[d.DebtId] > 0).OrderBy(d => simulatedBalances[d.DebtId]).FirstOrDefault()
                    : debts.Where(d => simulatedBalances[d.DebtId] > 0).OrderByDescending(d => d.InterestRate).FirstOrDefault();

                if (targetDebt == null) break;

                var existingPayment = paymentsToMake.FirstOrDefault(p => p.DebtId == targetDebt.DebtId);

                decimal amountNeeded = simulatedBalances[targetDebt.DebtId];

                decimal paymentAmount = Math.Min(remainingMoney, amountNeeded);

                if (existingPayment != null)
                {
                    existingPayment.Amount += paymentAmount;
                }
                else
                {
                    paymentsToMake.Add(new PaymentDto
                    {
                        DebtId = targetDebt.DebtId,
                        Amount = paymentAmount,
                        Date = targetDate,
                        CalculationReportId = reportId ?? Guid.Empty
                    });
                }

                simulatedBalances[targetDebt.DebtId] -= paymentAmount;
                remainingMoney -= paymentAmount;
            }

            return await _paymentRepository.AddBulkPaymentsAsync(paymentsToMake, userId);
        }

        public async Task<List<ActualPaymentDto>> GetUserPaymentsAsync(string userId, Guid? reportId = null)
        {
            return await _paymentRepository.GetUserPaymentsAsync(userId, reportId);
        }
    }
}