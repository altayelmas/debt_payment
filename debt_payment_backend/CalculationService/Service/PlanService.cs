using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Dto;
using debt_payment_backend.CalculationService.Model.Dto;

namespace CalculationService.Service
{
    public interface PlanService
    {
        Task<bool> ActivatePlanAsync(string userId, Guid reportId, string strategy);
        Task<CalculationResultDto?> GetActivePlanAsync(string userId);
        Task<RecalculateResultDto?> RecalculateActivePlanAsync(string userId);
    }
}