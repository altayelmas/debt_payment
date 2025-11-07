using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.IdentityService.Model.Dto
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public bool IsSuccess { get; set;}
        public IEnumerable<string> Errors { get; set; } = Enumerable.Empty<string>();
    }
}