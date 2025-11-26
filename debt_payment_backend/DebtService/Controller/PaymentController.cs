using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using DebtService.Model.Dto;
using DebtService.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DebtService.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController: ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        private string GetUserIdFromToken()
        {
            return User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        [HttpPost]
        public async Task<IActionResult> AddPayment([FromBody] PaymentDto request) 
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _paymentService.AddPaymentAsync(request, userId);

            if (!success) return NotFound("Debt not found or does not belong to user.");
            return Ok(new
            {
                Message = "Payment added successfully"
            });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetPaymentHistory([FromQuery] Guid? reportId = null)
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var payments = await _paymentService.GetUserPaymentsAsync(userId, reportId);
            
            return Ok(payments);
        }

        [HttpPost("bulk/{reportId:guid}")]
        public async Task<IActionResult> AddBulkPayment([FromBody] List<PaymentDto> request, [FromRoute] Guid reportId)
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _paymentService.AddBulkPaymentAsync(request, userId);
            
            if (!success) return BadRequest("Could not process payments.");
            
            return Ok(new { message = "Payments recorded successfully." });
        }

        [HttpPost("distribute")]
        public async Task<IActionResult> DistributePayment([FromBody] DistributePaymentRequest request)
        {
            var userId = GetUserIdFromToken();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _paymentService.DistributeAndPayAsync(
                request.Amount, 
                userId, 
                request.Strategy, 
                request.Date, 
                request.CalculationReportId
            );

            if (!success) return BadRequest("Payment failed or no active debts.");

            return Ok(new { message = "Payment distributed and recorded." });
        }
    }
}