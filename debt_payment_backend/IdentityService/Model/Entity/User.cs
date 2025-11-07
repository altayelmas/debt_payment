using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace debt_payment_backend.IdentityService.Model.Entity
{
    public class User: IdentityUser
    {
    }
}