using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Entity;

namespace CalculationService.Repository
{
    public interface PlanRepository
    {
        Task<List<UserActivePlan>?> GetActivePlansByUserIdAsync(string userId);
        Task<UserActivePlan?> GetActivePlanByUserIdAsync(string userId);
        Task<UserActivePlan> AddUserActivePlanAsync(UserActivePlan userActivePlan);
        Task<bool> SaveChangesAsync();
    }
}