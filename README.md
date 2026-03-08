# x402 Paid APIs

Two production-ready x402 payment endpoints for AI agents and developers.

## 🚀 Endpoints

### 1. Balance Check API - $0.01/call
Check cryptocurrency balances across multiple chains and tokens.

```bash
curl http://localhost:3000/api/balance?address=0x...&token=USDC
```

**Response:**
```json
{
  "address": "0x...",
  "token": "USDC",
  "balance": "1250.50",
  "decimals": 6,
  "network": "base",
  "timestamp": "2026-03-08T07:00:00Z"
}
```

### 2. Yield Recommendation API - $0.05/call
Get optimized yield farming recommendations based on risk profile.

```bash
curl http://localhost:3000/api/yield?amount=10000&risk=medium&duration=30
```

**Response:**
```json
{
  "recommendations": [
    {
      "protocol": "Aave",
      "apy": 8.5,
      "risk": "low",
      "token": "USDC",
      "lockupDays": 0
    },
    {
      "protocol": "Compound",
      "apy": 7.2,
      "risk": "low",
      "token": "USDC",
      "lockupDays": 0
    }
  ],
  "optimalStrategy": "Aave USDC Lending",
  "estimatedYield": 850.00,
  "timestamp": "2026-03-08T07:00:00Z"
}
```

## 💰 Pricing

| Endpoint | Price | Use Case |
|----------|-------|----------|
| Balance Check | $0.01 | Portfolio tracking, balance verification |
| Yield Recommendation | $0.05 | DeFi planning, investment decisions |

**Payment Method:** USDC on Base (testnet: base-sepolia)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your wallet address:
- `PAYMENT_ADDRESS`: Your Base wallet address to receive payments
- `FACILITATOR_URL`: Use test facilitator for development
- `NETWORK`: `base-sepolia` for testing, `base` for mainnet

### 3. Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Deploy to Vercel

```bash
vercel deploy --prod
```

## 🔗 x402 Payment Flow

1. **Initial Request**: Client sends request without payment
2. **402 Response**: Server responds with `PAYMENT-REQUIRED` header containing price and payment details
3. **Client Pays**: Client signs payment and retries with `PAYMENT-SIGNATURE` header
4. **Verification**: Server verifies payment via facilitator
5. **Access Granted**: Server returns requested data with HTTP 200

## 🧪 Testing with Testnet USDC

1. Get test USDC on Base Sepolia:
   - Faucet: https://faucets.chain.link/base-sepolia
   - Bridge: https://bridge.base.org/

2. Use a test wallet (never use mainnet keys for testing)

3. Test endpoints with x402-compatible client:

```typescript
import { withPaymentInterceptor } from '@x402/core/client';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({ chain: baseSepolia, transport: http() });
const api = withPaymentInterceptor(client, { privateKey: 'YOUR_TEST_KEY' });

// Balance check
const balance = await api.get('/api/balance', {
  params: { address: '0x...', token: 'USDC' }
});

// Yield recommendation
const yield = await api.get('/api/yield', {
  params: { amount: 10000, risk: 'medium' }
});
```

## 📚 API Documentation

### Balance Check Endpoint

**URL:** `GET /api/balance`

**Query Parameters:**
- `address` (required): Wallet address to check
- `token` (optional): Token symbol (default: USDC)
- `network` (optional): Network name (default: base)

**Pricing:** $0.01 USDC per call

**Rate Limits:** 100 calls/minute per wallet

### Yield Recommendation Endpoint

**URL:** `GET /api/yield`

**Query Parameters:**
- `amount` (required): Investment amount in USD
- `risk` (required): Risk tolerance (`low`, `medium`, `high`)
- `duration` (optional): Investment duration in days (default: 30)

**Pricing:** $0.05 USDC per call

**Rate Limits:** 50 calls/minute per wallet

## 🔐 Security

- Payments verified via Coinbase CDP facilitator
- No API keys required - payments are the authentication
- Rate limiting prevents abuse
- All transactions settle on-chain (~2 seconds)

## 🎯 Use Cases

- **AI Agents**: Autonomous payments for API access
- **DeFi Dashboards**: Real-time balance checks
- **Portfolio Trackers**: Multi-wallet monitoring
- **Yield Optimizers**: Investment strategy recommendations

## 📄 License

MIT

## 🤝 Support

GitHub Issues: https://github.com/your-org/x402-apis/issues

---

Built with x402 Protocol - Internet-native payments for AI agents
