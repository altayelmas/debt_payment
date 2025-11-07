using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
        public CalculationController(CalculateService calculationService)
        {
            _calculationService = calculationService;
        }

        private string GetUserIdFromToken()
        {
            return User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        [HttpPost("calculate")]
        public async Task<ActionResult<CalculationResultDto>> Calculate([FromBody] CalculationRequestDto request)
        {
            try
            {
                var userId = GetUserIdFromToken();
                var result = await _calculationService.CalculateAsync(request, userId);

                if (result == null)
                {
                    return BadRequest("No debts are found for the calculation.");
                }

                return Ok(result);
            } catch (InvalidOperationException e)
            {
                return BadRequest(e.Message);
            } catch (OverflowException e)
            {
                return BadRequest("The payment amount has grown too large to calculate the balance because it does not cover the monthly interest. Please increase the payment amount.");
            } catch (Exception e)
            {
                return StatusCode(500, "A server-side error occurred during calculation.");
            }
           
        }
    }
}