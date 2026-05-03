using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaultBackend.Data;
using VaultBackend.Models;
using Stripe.Checkout;
using Stripe;

namespace VaultBackend.Controllers
{
    /// <summary>
    /// Manages user wallet operations, including PKR deposits via Stripe
    /// and Vault Points tracking.
    /// </summary>
    [ApiController]
    [Route("api/wallet")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public WalletController(AppDbContext db, IConfiguration config) 
        { 
            _db = db; 
            _config = config;
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
        }

        // GET /api/wallet/my-balance
        [HttpGet("my-balance")]
        public async Task<IActionResult> GetBalance()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var wallet = await _db.Wallets
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) return NotFound(new { message = "Wallet not found" });

            return Ok(new
            {
                wallet.WalletId,
                wallet.Balance,
                wallet.VaultPoints,
                wallet.Currency,
                wallet.CreatedAt,
            });
        }

        // POST /api/wallet/create-checkout-session
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] DepositRequest request)
        {
            if (request.Amount <= 0)
                return BadRequest(new { message = "Amount must be greater than 0" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null) return NotFound(new { message = "Wallet not found" });

            var domain = "http://localhost:5173";
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(request.Amount * 100), // Stripe expects cents
                            Currency = "pkr",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "V.A.U.L.T. Wallet Deposit",
                                Description = "PKR deposit to your platform wallet"
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = domain + "/wallet?session_id={CHECKOUT_SESSION_ID}",
                CancelUrl = domain + "/wallet",
                Metadata = new Dictionary<string, string>
                {
                    { "UserId", userId.ToString() },
                    { "Amount", request.Amount.ToString() }
                }
            };

            if (_config["Stripe:SecretKey"] == "sk_test_dummykeyforpresentation1234")
            {
                // MOCK MODE FOR PRESENTATION: Bypasses Stripe and redirects immediately back to Wallet
                var mockSessionId = "mock_session_" + Guid.NewGuid().ToString();
                return Ok(new { url = domain + $"/wallet?session_id={mockSessionId}&mock_amount={request.Amount}" });
            }

            try
            {
                var service = new SessionService();
                Session session = await service.CreateAsync(options);
                return Ok(new { url = session.Url });
            }
            catch (StripeException e)
            {
                // If the dummy key is still being used, or an invalid key is provided, catch it gracefully.
                var errorMsg = e.StripeError?.Message ?? e.Message;
                return BadRequest(new { message = $"Stripe Error: {errorMsg}. Please ensure you have a valid Stripe Secret Key in appsettings.json!" });
            }
        }

        // POST /api/wallet/verify-session
        [HttpPost("verify-session")]
        public async Task<IActionResult> VerifySession([FromBody] VerifySessionRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId))
                return BadRequest(new { message = "Session ID is required" });

            if (_config["Stripe:SecretKey"] == "sk_test_dummykeyforpresentation1234" && request.SessionId.StartsWith("mock_session_"))
            {
                // MOCK MODE FOR PRESENTATION
                decimal mockAmount = request.MockAmount ?? 500;
                
                var mockUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var mockWallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == mockUserId);
                if (mockWallet == null) return NotFound(new { message = "Wallet not found" });

                var alreadyProcessedMock = await _db.Transactions.AnyAsync(t => t.Description.Contains(request.SessionId));
                if (alreadyProcessedMock)
                    return Ok(new { message = "Session already processed", newBalance = mockWallet.Balance });

                mockWallet.Balance += mockAmount;
                _db.Transactions.Add(new Transaction
                {
                    WalletId = mockWallet.WalletId,
                    Amount = mockAmount,
                    Type = TransactionType.Deposit,
                    Description = $"Stripe Deposit (Mock) {request.SessionId} - PKR {mockAmount:N0}"
                });
                await _db.SaveChangesAsync();

                return Ok(new { message = $"PKR {mockAmount:N0} deposited successfully!", newBalance = mockWallet.Balance });
            }

            var service = new SessionService();
            Session session;
            try
            {
                session = await service.GetAsync(request.SessionId);
            }
            catch (Exception)
            {
                return BadRequest(new { message = "Invalid session ID" });
            }

            if (session.PaymentStatus != "paid")
                return BadRequest(new { message = "Payment not completed" });

            var userId = int.Parse(session.Metadata["UserId"]);
            var amount = decimal.Parse(session.Metadata["Amount"]);

            var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null) return NotFound(new { message = "Wallet not found" });

            // Check if transaction already exists for this Stripe Session
            var alreadyProcessed = await _db.Transactions.AnyAsync(t => t.Description.Contains(session.Id));
            if (alreadyProcessed)
                return Ok(new { message = "Session already processed", newBalance = wallet.Balance });

            wallet.Balance += amount;

            var transaction = new Transaction
            {
                WalletId = wallet.WalletId,
                Amount = amount,
                Type = TransactionType.Deposit,
                Description = $"Stripe Deposit {session.Id} - PKR {amount:N0}"
            };

            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"PKR {amount:N0} deposited successfully!", newBalance = wallet.Balance });
        }

        // POST /api/wallet/convert
        [HttpPost("convert")]
        public async Task<IActionResult> Convert([FromBody] ConvertRequest request)
        {
            if (request.AmountPkr <= 0)
                return BadRequest(new { message = "Amount must be greater than 0" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) return NotFound(new { message = "Wallet not found" });

            if (wallet.Balance < request.AmountPkr)
                return StatusCode(402, new { message = "Insufficient PKR balance" });

            int vpAmount = (int)(request.AmountPkr / 5); // 5 PKR = 1 VP
            decimal actualPkrDeducted = vpAmount * 5;

            if (vpAmount <= 0)
                return BadRequest(new { message = "Minimum conversion is 5 PKR" });

            wallet.Balance -= actualPkrDeducted;
            wallet.VaultPoints += vpAmount;

            _db.Transactions.Add(new Transaction
            {
                WalletId = wallet.WalletId,
                Amount = actualPkrDeducted,
                Type = TransactionType.Convert,
                Description = $"Converted PKR {actualPkrDeducted:N0} to {vpAmount:N0} VP"
            });

            await _db.SaveChangesAsync();

            return Ok(new { message = $"Successfully converted to {(int)vpAmount:N0} VP!", newBalance = wallet.Balance, newVaultPoints = wallet.VaultPoints });
        }

        // POST /api/wallet/purchase
        [HttpPost("purchase")]
        public async Task<IActionResult> Purchase([FromBody] PurchaseRequest request)
        {
            if (request.CostVp <= 0)
                return BadRequest(new { message = "Invalid cost" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) return NotFound(new { message = "Wallet not found" });

            if (wallet.VaultPoints < request.CostVp)
                return StatusCode(402, new { message = "Insufficient Vault Points" });

            wallet.VaultPoints -= request.CostVp;

            _db.Transactions.Add(new Transaction
            {
                WalletId = wallet.WalletId,
                Amount = request.CostVp,
                Type = TransactionType.Purchase,
                Description = $"Purchased {request.ItemName} for {request.CostVp:N0} VP"
            });

            await _db.SaveChangesAsync();

            return Ok(new { message = $"Successfully purchased {request.ItemName}!", newVaultPoints = wallet.VaultPoints });
        }

        // GET /api/wallet/transactions
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var wallet = await _db.Wallets
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) return NotFound(new { message = "Wallet not found" });

            var txns = wallet.Transactions
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.TransactionId,
                    t.Amount,
                    Type = t.Type.ToString(),
                    t.Description,
                    t.CreatedAt,
                })
                .ToList();

            return Ok(txns);
        }
    }

    public class DepositRequest
    {
        public decimal Amount { get; set; }
    }

    public class ConvertRequest
    {
        public decimal AmountPkr { get; set; }
    }

    public class VerifySessionRequest
    {
        public string SessionId { get; set; } = string.Empty;
        public decimal? MockAmount { get; set; }
    }

    public class PurchaseRequest
    {
        public string ItemName { get; set; } = string.Empty;
        public int CostVp { get; set; }
    }
}
