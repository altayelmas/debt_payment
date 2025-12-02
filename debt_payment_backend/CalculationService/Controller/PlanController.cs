using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculationService.Model.Dto;
using CalculationService.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalculationService.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlanController: ControllerBase
    {
        private readonly PlanService _planService;
        public PlanController(PlanService planService)
        {
            _planService = planService;
        }

        private string GetUserIdFromToken()
        {
            return User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        [HttpPost("activate")]
        public async Task<IActionResult> ActivatePlan([FromBody] ActivatePlanRequest request)
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _planService.ActivatePlanAsync(userId, request.ReportId, request.Strategy);

            if (!success) return NotFound("Report not found.");

            return Ok(new { message = "Plan activated successfully." });
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActivePlan()
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var plan = await _planService.GetActivePlanAsync(userId);

            if (plan == null) return NoContent();

            return Ok(plan);
        }

        [HttpPost("recalculate")]
        public async Task<IActionResult> RecalculatePlan()
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var newReportId = await _planService.RecalculateActivePlanAsync(userId);

            if (newReportId == null) return NotFound("Active plan not found.");

            return Ok(new { message = "Plan recalculated successfully.", reportId = newReportId });
        }       
    }
}