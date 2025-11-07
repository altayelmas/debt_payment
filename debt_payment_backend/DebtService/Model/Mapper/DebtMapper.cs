using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Dto;
using debt_payment_backend.DebtService.Model.Entity;

namespace debt_payment_backend.DebtService.Model.Mapper
{
    public static class DebtMapper
    {
        public static DebtDto MapDebtToDto(this Debt debt)
        {
            return new DebtDto
            {
                DebtId = debt.DebtId,
                Name = debt.Name,
                CurrentBalance = debt.CurrentBalance,
                InterestRate = debt.InterestRate,
                MinPayment = debt.MinPayment,
                CreatedAt = debt.CreatedAt
            };
        }
    }
}