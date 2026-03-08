# 🚀 x402 Paid APIs - Live in 5 Minutes

Production-ready x402 payment endpoints for AI agents. Deploy and start accepting crypto payments in minutes.

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/the-thomas-code/x402-paid-apis.git
cd x402-paid-apis
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:
```env
PAYMENT_ADDRESS=0xYourBaseWallet
NETWORK=base-sepolia  # Use 'base' for mainnet
FACILITATOR_URL=https://x402.org/facilitator
```

### 3. Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Test Endpoints

```bash
# Balance Check - $0.01
curl http://localhost:3000/api/balance?address=0x1234&token=USDC

# Yield Recommendations - $0.05
curl http://localhost:3000/api/yield?amount=10000&risk=medium
```

## 📡 Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/balance` | $0.01 | Check crypto balances |
| `GET /api/yield` | $0.05 | Get yield farming recommendations |
| `GET /api/pricing` | Free | View pricing info |
| `GET /api/health` | Free | Health check |

## 🌐 Deploy to Production

### Vercel (Recommended)

```bash
vercel deploy --prod
```

Then set environment variables in Vercel dashboard:
- `PAYMENT_ADDRESS`: Your wallet
- `NETWORK`: `base`
- `FACILITATOR_URL`: `https://api.cdp.coinbase.com/platform/v2/x402`
- `CDP_API_KEY_NAME`: Your CDP key name
- `CDP_API_KEY_PRIVATE`: Your CDP private key

### Railway

1. Push to GitHub (already done)
2. Go to https://railway.app
3. New Project → Deploy from GitHub
4. Select `x402-paid-apis`
5. Add environment variables

## 🧪 Testing with Testnet

1. **Get test USDC:**
   - https://faucets.chain.link/base-sepolia
   - https://bridge.base.org/

2. **Update .env for testnet:**
   ```env
   NETWORK=base-sepolia
   FACILITATOR_URL=https://x402.org/facilitator
   ```

3. **Test with example client:**
   ```bash
   npx tsx examples/client-example.ts balance
   ```

## 💰 How x402 Payments Work

1. Client requests API endpoint
2. Server responds with HTTP 402 + payment requirements
3. Client signs payment with wallet
4. Client retries with `PAYMENT-SIGNATURE` header
5. Server verifies via facilitator (~2 seconds)
6. Server returns requested data

**No API keys. No accounts. Just pay-per-call.**

## 📚 Documentation

- [Full README](README.md)
- [Deployment Guide](DEPLOY.md)
- [Client Examples](examples/client-example.ts)
- [x402 Docs](https://docs.x402.org)

## 🔐 Security

- ✅ Payments verified via Coinbase CDP facilitator
- ✅ Rate limiting prevents abuse
- ✅ No sensitive data stored
- ✅ On-chain settlement (Base)
- ✅ CORS configured for production

## 🎯 Use Cases

- **AI Agents**: Autonomous micropayments for API access
- **DeFi Apps**: Real-time balance checks and yield data
- **SaaS**: Pay-per-use API monetization
- **Data Providers**: Metered API access

## 📊 Economics

**Example: 10,000 API calls/month**
- Revenue: $100-500 (mix of endpoints)
- Costs: ~$11 (facilitator + gas + hosting)
- **Profit: $89-489/month**

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Add tests
4. Submit PR

## 📄 License

MIT

## 🔗 Links

- **GitHub**: https://github.com/the-thomas-code/x402-paid-apis
- **Live Demo**: [Deploy your own](#deploy-to-production)
- **x402 Protocol**: https://x402.org

---

**Built with x402 Protocol** — Internet-native payments for AI agents 🤖💰
