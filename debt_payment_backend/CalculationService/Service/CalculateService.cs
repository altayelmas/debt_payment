using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.CalculationService.Model.Dto;

namespace debt_payment_backend.CalculationService.Service
{
    public interface CalculateService
    {
        Task<CalculationResultDto> CalculateAsync(CalculationRequestDto request, string userId);
    }
}