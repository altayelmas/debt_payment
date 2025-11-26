using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DebtService.Model.Dto;
using DebtService.Model.Entity;

namespace DebtService.Repository
{
    public interface PaymentRepository
    {
        Task<bool> SaveChangesAsync();
        Task<ActualPayment> AddPaymentAsync(ActualPayment payment);
        Task<List<ActualPaymentDto>> GetUserPaymentsAsync(string userId, Guid? reportId = null);
        Task<bool> AddBulkPaymentsAsync(List<PaymentDto> payments, string userId);
        
    }
}