using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.CalculationService.Model.Dto;

namespace CalculationService.Service
{
    public interface PlanService
    {
        Task<bool> ActivatePlanAsync(string userId, Guid reportId, string strategy);
        Task<CalculationResultDto?> GetActivePlanAsync(string userId);
        Task<Guid?> RecalculateActivePlanAsync(string userId);
    }
}