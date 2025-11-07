using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.IdentityService.Model.Dto
{
    public class UserRegisterDto
    {
        [Required, EmailAddress]
        public String Email { get; set; } = string.Empty;
        [Required, MinLength(8)]
        public String Password { get; set; } = string.Empty;
    }
}