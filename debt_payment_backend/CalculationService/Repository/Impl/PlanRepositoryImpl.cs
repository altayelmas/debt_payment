using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CalculationService.Data;
using CalculationService.Model.Entity;

namespace CalculationService.Repository.Impl
{
    public class PlanRepositoryImpl : PlanRepository
    {
        private readonly ApplicationDbContext _context;

        public PlanRepositoryImpl(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserActivePlan> AddUserActivePlanAsync(UserActivePlan userActivePlan)
        {
            await _context.UserActivePlans.AddAsync(userActivePlan);
            return userActivePlan;
        }

        public async Task<UserActivePlan?> GetActivePlanByUserIdAsync(string userId)
        {
            return await _context.UserActivePlans
                .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);
        }

        public async Task<List<UserActivePlan>?> GetActivePlansByUserIdAsync(string userId)
        {
            return await _context.UserActivePlans
                .Where(p => p.UserId == userId && p.IsActive)
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task UpdateUserActivePlanAsync(UserActivePlan userActivePlan)
        {
            _context.UserActivePlans.Update(userActivePlan);
            await _context.SaveChangesAsync();
        }
    }
}