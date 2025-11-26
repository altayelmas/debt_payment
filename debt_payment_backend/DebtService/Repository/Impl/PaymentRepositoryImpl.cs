using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Data;
using DebtService.Model.Dto;
using DebtService.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace DebtService.Repository.Impl
{
    public class PaymentRepositoryImpl : PaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepositoryImpl(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ActualPayment> AddPaymentAsync(ActualPayment payment)
        {
            await _context.ActualPayments.AddAsync(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<bool> SaveChangesAsync()
        {
            _context.SaveChanges();
            return true;
        }

        public async Task<List<ActualPaymentDto>> GetUserPaymentsAsync(string userId, Guid? reportId = null)
        {
            var query = _context.ActualPayments
                .Include(p => p.Debt)
                .Where(p => p.Debt.UserId == userId);

            if (reportId.HasValue)
            {
                query = query.Where(p => p.CalculationReportId == reportId.Value);
            }

            return await query
                .Select(p => new ActualPaymentDto 
                {
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate
                })
                .ToListAsync();
        }

        public async Task<bool> AddBulkPaymentsAsync(List<PaymentDto> payments, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var paymentDto in payments)
                {
                    if (paymentDto.Amount <= 0) continue;

                    var debt = await _context.Debts
                        .FirstOrDefaultAsync(d => d.DebtId == paymentDto.DebtId && d.UserId == userId);

                    if (debt == null) continue;

                    var payment = new ActualPayment
                    {
                        DebtId = paymentDto.DebtId,
                        Amount = paymentDto.Amount,
                        PaymentDate = paymentDto.Date,
                        CalculationReportId = paymentDto.CalculationReportId
                    };
                    await _context.ActualPayments.AddAsync(payment);

                    debt.CurrentBalance -= paymentDto.Amount;
                    if (debt.CurrentBalance < 0) debt.CurrentBalance = 0;
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }
    }
}