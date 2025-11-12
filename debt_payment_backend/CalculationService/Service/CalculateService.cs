using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Entity;
using debt_payment_backend.CalculationService.Model.Dto;

namespace debt_payment_backend.CalculationService.Service
{
    public interface CalculateService
    {
        Task<Guid> CalculateAsync(CalculationRequestDto request, string userId);
        Task<CalculationResultDto> GetCalculationResultById(string userId, Guid reportId);
        Task<List<CalculationHistoryDto>> GetCalculationHistory(string userId);
    }
}