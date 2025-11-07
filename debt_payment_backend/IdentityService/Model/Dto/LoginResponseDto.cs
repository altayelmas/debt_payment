using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.IdentityService.Model.Dto
{
    public class LoginResponseDto
    {
        public String Token { get; set; } = string.Empty;
    }
}