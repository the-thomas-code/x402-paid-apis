import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000";
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://x402.org/facilitator";
const NETWORK = process.env.NETWORK || "base";
const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = process.env.CDP_API_KEY_SECRET;

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

// Create x402 resource server with EVM scheme
const server = new x402ResourceServer(facilitatorClient, {
  cdpApiKeyId: process.env.CDP_API_KEY_ID,
  cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
});
server.register("eip155:*", new ExactEvmScheme());

// CORS setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Payment", "Payment-Signature", "Payment-Required"],
    exposedHeaders: ["Payment-Response"],
  })
);

app.use(express.json());

// Payment middleware configuration
const paymentConfig: any = {
  // Balance Check API - $0.01
  "GET /api/balance": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.01",
        network: NETWORK === "base" ? "eip155:8453" : "eip155:84532", // Base mainnet or Sepolia
        payTo: PAYMENT_ADDRESS,
      },
    ],
    description: "Balance check API - Get crypto balance for any address",
    mimeType: "application/json",
  },
  // Yield Recommendation API - $0.05
  "GET /api/yield": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.05",
        network: NETWORK === "base" ? "eip155:8453" : "eip155:84532",
        payTo: PAYMENT_ADDRESS,
      },
    ],
    description: "Yield recommendation API - Get DeFi yield farming strategies",
    mimeType: "application/json",
  },
};

// Apply payment middleware
app.use(paymentMiddleware(paymentConfig, server));

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
function rateLimit(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const wallet = (req.headers["x-wallet-address"] as string) || "anonymous";
    const now = Date.now();
    const record = rateLimitStore.get(wallet);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(wallet, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    next();
  };
}

// Mock balance data (in production, integrate with actual blockchain RPC)
async function getBalance(address: string, token: string = "USDC", network: string = "base") {
  // Simulated balance lookup - replace with actual RPC calls in production
  const mockBalances: Record<string, number> = {
    "0x1234": 1250.5,
    "0x5678": 5000.0,
    "0x9abc": 250.75,
  };

  return {
    address,
    token,
    balance: mockBalances[address.substring(0, 6)] || (Math.random() * 10000).toFixed(2),
    decimals: 6,
    network,
    timestamp: new Date().toISOString(),
  };
}

// Mock yield recommendations (in production, integrate with DeFi APIs like DefiLlama)
async function getYieldRecommendations(amount: number, risk: string, duration: number = 30) {
  const strategies: any = {
    low: [
      { protocol: "Aave", apy: 8.5, risk: "low", token: "USDC", lockupDays: 0 },
      { protocol: "Compound", apy: 7.2, risk: "low", token: "USDC", lockupDays: 0 },
      { protocol: "MakerDAO", apy: 6.8, risk: "low", token: "DAI", lockupDays: 0 },
    ],
    medium: [
      { protocol: "Curve", apy: 12.3, risk: "medium", token: "3pool", lockupDays: 7 },
      { protocol: "Convex", apy: 11.5, risk: "medium", token: "USDC", lockupDays: 14 },
      { protocol: "Yearn", apy: 10.8, risk: "medium", token: "USDC", lockupDays: 0 },
    ],
    high: [
      { protocol: "Uniswap V3", apy: 25.4, risk: "high", token: "USDC-ETH", lockupDays: 0 },
      { protocol: "Balancer", apy: 22.1, risk: "high", token: "WETH-USDC", lockupDays: 30 },
      { protocol: "GMX", apy: 18.7, risk: "high", token: "GLP", lockupDays: 0 },
    ],
  };

  const recommendationList = strategies[risk as keyof typeof strategies] || strategies.medium;
  const optimal = recommendationList.reduce((prev: any, curr: any) => (prev.apy > curr.apy ? prev : curr));

  return {
    recommendations: recommendationList,
    optimalStrategy: `${optimal.protocol} ${optimal.token} ${risk === "high" ? "LP" : "Lending"}`,
    estimatedYield: (amount * (optimal.apy / 100) * (duration / 365)).toFixed(2),
    timestamp: new Date().toISOString(),
  };
}

// Pricing endpoint (no payment required)
app.get("/api/pricing", (req: express.Request, res: express.Response) => {
  res.json({
    endpoints: {
      "/api/balance": {
        price: "$0.01",
        description: "Balance check API",
      },
      "/api/yield": {
        price: "$0.05",
        description: "Yield recommendation API",
      },
    },
    paymentNetwork: NETWORK === "base" ? "Base Mainnet" : "Base Sepolia Testnet",
    paymentAsset: "USDC",
    facilitator: FACILITATOR_URL,
  });
});

// Health check (no payment required)
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({
    status: "healthy",
    network: NETWORK,
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    x402Version: "2.3.0",
  });
});

// Balance Check API - $0.01/call
app.get("/api/balance", rateLimit(100, 60000), async (req: express.Request, res: express.Response) => {
  try {
    const { address, token = "USDC", network = "base" } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const balance = await getBalance(address as string, token as string, network as string);
    res.json(balance);
  } catch (error) {
    console.error("Balance check error:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Yield Recommendation API - $0.05/call
app.get("/api/yield", rateLimit(50, 60000), async (req: express.Request, res: express.Response) => {
  try {
    const { amount, risk, duration = 30 } = req.query;

    if (!amount || !risk) {
      return res.status(400).json({ error: "Amount and risk parameters are required" });
    }

    const validRisks = ["low", "medium", "high"];
    if (!validRisks.includes(risk as string)) {
      return res.status(400).json({
        error: "Invalid risk level. Must be: low, medium, or high",
      });
    }

    const recommendations = await getYieldRecommendations(
      parseFloat(amount as string),
      risk as string,
      parseInt(duration as string)
    );

    res.json(recommendations);
  } catch (error) {
    console.error("Yield recommendation error:", error);
    res.status(500).json({ error: "Failed to get yield recommendations" });
  }
});

// Documentation endpoint (no payment required)
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({
    name: "x402 Paid APIs",
    version: "2.0.0",
    description: "Two paid x402 endpoints for AI agents",
    endpoints: {
      balance: "GET /api/balance ($0.01/call)",
      yield: "GET /api/yield ($0.05/call)",
      pricing: "GET /api/pricing (free)",
      health: "GET /api/health (free)",
    },
    documentation: "https://github.com/the-thomas-code/x402-paid-apis#readme",
    x402Spec: "https://docs.x402.org",
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 x402 Paid APIs v2 running on port ${PORT}`);
  console.log(`📊 Network: ${NETWORK}`);
  console.log(`💰 Payment Address: ${PAYMENT_ADDRESS}`);
  console.log(`🔗 Facilitator: ${FACILITATOR_URL}`);
  console.log(`\nEndpoints:`);
  console.log(`  - GET /api/balance ($0.01/call)`);
  console.log(`  - GET /api/yield ($0.05/call)`);
  console.log(`  - GET /api/pricing (free)`);
  console.log(`  - GET /api/health (free)`);
});

export default app;
