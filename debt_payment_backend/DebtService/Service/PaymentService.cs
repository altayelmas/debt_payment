using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DebtService.Model.Dto;

namespace DebtService.Service
{
    public interface PaymentService
    {
        Task<bool> AddPaymentAsync(PaymentDto paymentDto, string userId);
        Task<List<ActualPaymentDto>> GetUserPaymentsAsync(string userId, Guid? reportId = null);
        Task<bool> AddBulkPaymentAsync(List<PaymentDto> payments, string userId);
        Task<bool> DistributeAndPayAsync(decimal totalAmount, 
            string userId, 
            string strategy = "Avalanche", 
            DateTime? date = null,
            Guid? reportId = null);
    }
}