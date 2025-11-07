using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace debt_payment_backend.Tests
{
    public class TestAuthHandler: AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string TestUserId = "test-user-id-12345";
        public const string TestAuthScheme = "Test";

        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, TestUserId),
                new Claim(ClaimTypes.Name, "Test User"),
                new Claim(ClaimTypes.Email, "test@example.com")
            };
            
            var identity = new ClaimsIdentity(claims, TestAuthScheme);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, TestAuthScheme);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }

}