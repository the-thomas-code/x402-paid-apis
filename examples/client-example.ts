/**
 * x402 Paid APIs - Example Client
 * 
 * This example shows how to integrate with the x402 payment endpoints
 * using the official @x402/client package.
 */

import { createPublicClient, http, createWalletClient, walletActions } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { withPaymentInterceptor } from '@x402/core/client';

// Configuration
const RPC_URL = 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY';
const API_BASE_URL = 'http://localhost:3000';

// Example 1: Balance Check API
export async function checkBalance(address: string, token: string = 'USDC') {
  try {
    // Create viem client with payment capabilities
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(RPC_URL)
    });

    // Wrap fetch with x402 payment handling
    const fetchWithPayment = withPaymentInterceptor(client);

    // Make the API call - payment happens automatically
    const response = await fetchWithPayment(`${API_BASE_URL}/api/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      params: new URLSearchParams({ address, token })
    });

    const data = await response.json();
    
    console.log('✅ Balance Check Result:');
    console.log(`   Address: ${data.address}`);
    console.log(`   Token: ${data.token}`);
    console.log(`   Balance: ${data.balance}`);
    console.log(`   Network: ${data.network}`);
    console.log(`   Payment Status: ${data.paymentStatus || 'settled'}`);
    
    return data;
  } catch (error) {
    console.error('❌ Balance check failed:', error);
    throw error;
  }
}

// Example 2: Yield Recommendation API
export async function getYieldRecommendations(
  amount: number,
  risk: 'low' | 'medium' | 'high',
  duration: number = 30
) {
  try {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(RPC_URL)
    });

    const fetchWithPayment = withPaymentInterceptor(client);

    const response = await fetchWithPayment(`${API_BASE_URL}/api/yield`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      params: new URLSearchParams({
        amount: amount.toString(),
        risk,
        duration: duration.toString()
      })
    });

    const data = await response.json();
    
    console.log('✅ Yield Recommendations:');
    console.log(`   Optimal Strategy: ${data.optimalStrategy}`);
    console.log(`   Estimated Yield: $${data.estimatedYield}`);
    console.log(`\n   Top Options:`);
    data.recommendations.forEach((rec: any, i: number) => {
      console.log(`   ${i + 1}. ${rec.protocol} - ${rec.apy}% APY (${rec.risk} risk)`);
    });
    
    return data;
  } catch (error) {
    console.error('❌ Yield recommendation failed:', error);
    throw error;
  }
}

// Example 3: Vanilla Fetch (Manual x402 Flow)
export async function manualX402Flow() {
  const address = '0x1234567890123456789012345678901234567890';
  
  try {
    // Step 1: Initial request (will return 402)
    const initialResponse = await fetch(`${API_BASE_URL}/api/balance?address=${address}`);
    
    if (initialResponse.status === 402) {
      console.log('💳 Payment required!');
      const paymentRequired = initialResponse.headers.get('Payment-Required');
      console.log('Payment details:', paymentRequired);
      
      // Step 2: Parse payment requirements and create payment
      // (In real implementation, sign with wallet and retry)
      // Step 3: Retry with Payment-Signature header
      
      console.log('➡️  Payment would be signed and request retried here');
    } else {
      const data = await initialResponse.json();
      console.log('✅ Balance:', data);
    }
  } catch (error) {
    console.error('❌ Manual flow failed:', error);
  }
}

// Example 4: Batch Operations (AI Agent Pattern)
export async function aiAgentWorkflow() {
  console.log('🤖 AI Agent Workflow - Automated Payment Flow\n');
  
  const wallets = [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x9876543210987654321098765432109876543210'
  ];
  
  for (const wallet of wallets) {
    try {
      console.log(`\n📊 Checking wallet: ${wallet.substring(0, 10)}...`);
      
      // Each call automatically pays $0.01
      await checkBalance(wallet);
    } catch (error) {
      console.error(`   Failed to check ${wallet}`);
    }
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n💰 Getting yield recommendations for $10,000 investment...');
  await getYieldRecommendations(10000, 'medium', 30);
  
  console.log('\n✅ AI Agent Workflow Complete!');
}

// CLI Execution
async function main() {
  console.log('🚀 x402 Paid APIs - Client Examples\n');
  console.log('=' .repeat(50));
  
  const example = process.argv[2] || 'all';
  
  switch (example) {
    case 'balance':
      await checkBalance('0x1234567890123456789012345678901234567890');
      break;
    
    case 'yield':
      await getYieldRecommendations(10000, 'medium', 30);
      break;
    
    case 'manual':
      await manualX402Flow();
      break;
    
    case 'agent':
      await aiAgentWorkflow();
      break;
    
    default:
      console.log('Usage: npx tsx examples/client-example.ts [balance|yield|manual|agent]');
      console.log('\nRunning balance check demo...\n');
      await checkBalance('0x1234567890123456789012345678901234567890');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
