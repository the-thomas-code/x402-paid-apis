# x402 Paid APIs - Deployment Guide

## Quick Deploy to Vercel

### 1. One-Click Deploy

```bash
vercel deploy --prod
```

### 2. Configure Environment Variables

After deploying, set these in Vercel dashboard:

- `PAYMENT_ADDRESS`: Your Base wallet address (receive payments)
- `FACILITATOR_URL`: `https://api.cdp.coinbase.com/platform/v2/x402` (production)
- `NETWORK`: `base` (mainnet) or `base-sepolia` (testnet)
- `CDP_API_KEY_NAME`: Your Coinbase CDP API key name
- `CDP_API_KEY_PRIVATE`: Your Coinbase CDP API private key

### 3. Test Deployment

```bash
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/pricing
```

## Deploy to Railway

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/x402-apis.git
git push -u origin main
```

### 2. Connect Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables

### 3. Railway Environment Variables

- `PAYMENT_ADDRESS`: Your Base wallet
- `FACILITATOR_URL`: `https://api.cdp.coinbase.com/platform/v2/x402`
- `NETWORK`: `base`
- `PORT`: `3000` (Railway auto-sets this)

## Deploy to Render

### 1. Create Web Service

```bash
# In Render dashboard:
# New + → Web Service → Connect GitHub repo
```

### 2. Build Settings

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment:** Node

### 3. Environment Variables

Same as Vercel/Railway configuration.

## Production Checklist

### Security

- [ ] Generate new wallet for production (never reuse test keys)
- [ ] Store private keys in secure vault (not in env vars)
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up monitoring and alerts
- [ ] Configure CORS for your domains only

### CDP Integration

1. Get CDP API keys: https://portal.cdp.coinbase.com/
2. Enable x402 facilitator access
3. Test with 1000 free monthly transactions
4. Production pricing: $0.001 per transaction after free tier

### Mainnet Setup

```env
# .env.production
PAYMENT_ADDRESS=0xYourMainnetWallet
FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
NETWORK=base
CDP_API_KEY_NAME=your-cdp-key-name
CDP_API_KEY_PRIVATE=-----BEGIN EC PRIVATE KEY-----...
```

### Testing

1. **Testnet First:**
   ```bash
   NETWORK=base-sepolia npm run dev
   ```

2. **Get Test USDC:**
   - https://faucets.chain.link/base-sepolia
   - https://bridge.base.org/

3. **Run Client Examples:**
   ```bash
   npx tsx examples/client-example.ts balance
   ```

4. **Verify Payments:**
   - Check your wallet for incoming USDC
   - Verify on BaseScan: https://basescan.org/

## Monitoring & Analytics

### Vercel Analytics

```bash
vercel link  # Link your project
vercel env add  # Add production env vars
```

### Health Checks

Set up uptime monitoring:
- UptimeRobot: https://uptimerobot.com/
- Ping endpoint: `https://your-app.vercel.app/api/health`

### Logging

- Vercel: Built-in function logs
- Railway: Live log streaming
- Add logging service: Logtail, Datadog, or Axiom

## Scaling Considerations

### Rate Limiting

Current limits (adjust in `src/index.ts`):
- Balance API: 100 calls/minute per wallet
- Yield API: 50 calls/minute per wallet

For production scaling:
1. Use Redis for distributed rate limiting
2. Implement wallet reputation system
3. Add premium tiers with higher limits

### Database (Optional)

For persistent data:
```bash
# Add to package.json
npm install @prisma/client prisma
npm install -D @types/prisma__client
```

### Caching

```typescript
// Cache balance results for 30 seconds
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds
```

## Troubleshooting

### Common Issues

**"Payment verification failed"**
- Check facilitator URL is correct
- Verify CDP API keys are valid
- Ensure wallet has sufficient USDC

**"Rate limit exceeded"**
- Increase limits in rateLimit middleware
- Implement Redis-based distributed limiting

**"Network error"**
- Verify Base RPC endpoint is accessible
- Check CORS configuration
- Ensure HTTPS in production

### Debug Mode

```env
NODE_ENV=development
DEBUG=x402:*
```

## Cost Breakdown

### Hosting

- **Vercel**: Free tier (100GB bandwidth), Pro $20/month
- **Railway**: $5/month base + usage
- **Render**: Free tier available, Starter $7/month

### Transaction Fees

- **Base Network Gas**: ~$0.0001 per transaction
- **CDP Facilitator**: Free 1000/month, then $0.001/tx
- **Your Revenue**: $0.01 - $0.05 per API call

### Example Economics

Assuming 10,000 API calls/month:
- Revenue: $100-500 (mix of endpoints)
- Costs: $10 (facilitator) + $1 (gas) + $20 (hosting)
- **Profit: $69-469/month**

## Support

- GitHub Issues: https://github.com/your-org/x402-apis/issues
- x402 Docs: https://docs.x402.org
- CDP Support: https://docs.cloud.coinbase.com/

---

**Next Steps:**
1. Deploy to staging (testnet)
2. Test thoroughly with client examples
3. Deploy to production (mainnet)
4. Monitor and optimize

Good luck! 🚀
