using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Dto;
using debt_payment_backend.DebtService.Service.Impl;
using DebtService.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace debt_payment_backend.DebtService.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DebtController : ControllerBase
    {
        private readonly DebtsService _debtService;

        public DebtController(DebtsService debtService)
        {
            _debtService = debtService;
        }

        private string GetUserIdFromToken()
        {
            return User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        [HttpPost]
        public async Task<ActionResult<DebtDto>> CreateDebt(DebtCreateUpdateDto request)
        {
            var userId = GetUserIdFromToken();
            var debtDto = await _debtService.CreateDebtAsync(request, userId);

            return CreatedAtAction(nameof(GetDebtById), new { debtId = debtDto.DebtId }, debtDto);
        }

        [HttpGet("{debtId}")]
        public async Task<IActionResult> GetDebtById([FromRoute] int debtId)
        {
            var userId = GetUserIdFromToken();
            var debtDto = await _debtService.GetDebtByIdAsync(debtId, userId);
            if (debtDto == null) return NotFound();
            return Ok(debtDto);
        }

        [HttpGet("internal/all-for-user")]
        public async Task<IActionResult> GetAllDebtsForInternalUse()
        {
            var userId = GetUserIdFromToken();
            var debtDtoList = await _debtService.GetAllDebtsForUserAsync(userId);
            return Ok(debtDtoList);
        }

        [HttpPut("{debtId}")]
        public async Task<IActionResult> UpdateDebt([FromRoute] int debtId, [FromBody] DebtCreateUpdateDto request)
        {
            var userId = GetUserIdFromToken();
            var serviceResultDto = await _debtService.UpdateDebtAsync(debtId, request, userId);

            if (serviceResultDto.NotFound)
            {
                return NotFound("Debt not found");
            }
            if (!serviceResultDto.IsSuccess)
            {
                return BadRequest(serviceResultDto.Error);
            }
            return NoContent();
        }

        [HttpDelete("{debtId}")]
        public async Task<IActionResult> DeleteDebt([FromRoute] int debtId)
        {
            var userId = GetUserIdFromToken();

            var serviceResultDto = await _debtService.DeleteDebtAsync(debtId, userId);

            if (serviceResultDto.NotFound)
            {
                return NotFound("Debt not found");
            }
            if (!serviceResultDto.IsSuccess)
            {
                return BadRequest(serviceResultDto.Error);
            }
            return NoContent();
        }

        [HttpGet]
        public async Task<ActionResult<PaginationDtos<DebtDto>>> GetDebts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 5;
            if (pageSize > 50) pageSize = 50;

            var userId = GetUserIdFromToken();
            var pagedResult = await _debtService.GetDebtsForUserAsync(userId, pageNumber, pageSize);
            return Ok(pagedResult);
        }
    }
}