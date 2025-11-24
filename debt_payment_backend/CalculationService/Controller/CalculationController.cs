using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using debt_payment_backend.CalculationService.Model.Dto;
using debt_payment_backend.CalculationService.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace debt_payment_backend.CalculationService.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalculationController : ControllerBase
    {
        private readonly CalculateService _calculationService;
        private readonly ILogger<CalculationController> _logger;
        public CalculationController(CalculateService calculationService, ILogger<CalculationController> logger)
        {
            _calculationService = calculationService;
            _logger = logger;
        }

        private string GetUserIdFromToken()
        {
            return User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        [HttpPost("calculate")]
        public async Task<IActionResult> Calculate([FromBody] CalculationRequestDto request)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }
                var result = await _calculationService.CalculateAsync(request, userId);

                if (result == null)
                {
                    return BadRequest(new { ErrorCode = "NO_DEBTS_FOUND", Message = "No debts are found for the calculation." });
                }

                return Ok(new { reportId = result });
            }
            catch (InvalidOperationException e)
            {
                return BadRequest(new { ErrorCode = "CALCULATION_LIMIT_EXCEEDED", Message = e.Message });
            }
            catch (OverflowException e)
            {
                return BadRequest(
                    new { 
                    ErrorCode = "PAYMENT_INSUFFICIENT", 
                    Message = "The payment amount has grown too large to calculate the balance because it does not cover the monthly interest." 
                });
            }
            catch (Exception e)
            {
                var userIdForLog = User?.Claims?.First(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? "unknown";
                _logger.LogError(e, "Unknown error during calculation. User: {UserId}", userIdForLog);
                return StatusCode(500, new { ErrorCode = "GENERIC_ERROR", Message = "A server-side error occurred during calculation." });
            }

        }

        [HttpGet("{reportId}")]
        public async Task<IActionResult> GetReportById([FromRoute] Guid reportId)
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var report = await _calculationService.GetCalculationResultById(userId, reportId);
            if (report == null)
            {
                return NotFound("Calculation report not found or you do not have permission.");
            }
            return Ok(report);


        }

        [HttpGet("history")]
        public async Task<IActionResult> GetCalculationHistory()
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var calculationHistory = await _calculationService.GetCalculationHistory(userId);

            return Ok(calculationHistory);
        }

        [HttpDelete("{reportId}")]
        public async Task<IActionResult> DeleteReportById([FromRoute] Guid reportId)
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var success = await _calculationService.DeleteCalculationById(userId, reportId);
            if (!success)
            {
                return NotFound("Calculation report not found or you do not have permission.");
            }
            return Ok();
        }

        [HttpGet("{reportId:guid}/pdf")]
        public async Task<IActionResult> GetReportPdf(
            [FromRoute] Guid reportId,
            [FromQuery] string strategy = "Snowball")
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized("User ID could not be retrieved from token.");

            var acceptLanguage = Request.Headers["Accept-Language"].ToString();
            var languageCode = string.IsNullOrEmpty(acceptLanguage) ? "en" : acceptLanguage;

            if (languageCode.Length > 2) languageCode = languageCode.Substring(0, 2);

            var textInfo = System.Globalization.CultureInfo.CurrentCulture.TextInfo;
            strategy = textInfo.ToTitleCase(strategy.ToLower());

            if (strategy != "Avalanche" && strategy != "Snowball")
            {
                strategy = "Snowball";
            }
            var pdfBytes = await _calculationService.GeneratePdfReportAsync(userId, reportId, strategy, languageCode);

            if (pdfBytes == null) return NotFound("Report not found.");
            
            return File(pdfBytes, "application/pdf", $"DebtPlan-{strategy}-{reportId}.pdf");
        }
    }
}