# 🏦 Credits & Optimization System

A comprehensive credit management and chat optimization system for your AI chatbot platform.

## 🎯 Overview

This system provides:
- **Credit-based billing** with multiple subscription tiers
- **Intelligent keyword responses** to save costs
- **Optimized OpenAI prompts** to reduce token usage
- **Load balancing** for high concurrent usage
- **Manual handoff** when credits are exhausted
- **Comprehensive analytics** for merchants

## 📊 Database Schema

### New Tables Added:
- **`MerchantPlan`** - Subscription tiers (Free, Basic, Pro, Enterprise)
- **`MerchantCredits`** - Credit balance and usage per shop
- **`UsageLog`** - Detailed logging for analytics and billing
- **`ChatConfiguration`** - Per-shop chat settings and limits

## 🚀 Quick Setup

### 1. Run Database Migration
```bash
npx prisma generate
npx prisma migrate dev --name add_credits_system
```

### 2. Initialize Credit System
```bash
npx ts-node scripts/initializeCredits.ts
```

### 3. Test the System
```bash
# Test keyword responses
curl -X POST http://localhost:3000/api/chat/test \
  -H "Content-Type: application/json" \
  -d '{"shop": "test-store.myshopify.com", "message": "hello", "testType": "both"}'
```

## 💰 Subscription Plans

| Plan | Credits/Month | Price | Max Concurrent | Features |
|------|---------------|-------|----------------|----------|
| **Free** | 1,000 | $0 | 2 | Basic AI, Analytics |
| **Basic** | 5,000 | $29 | 10 | + Email Support |  
| **Pro** | 20,000 | $99 | 50 | + Custom Branding, Priority Support |
| **Enterprise** | 100,000 | $299 | 200 | + Dedicated Support, SLA |

## ⚡ Optimization Features

### 1. Keyword-Based Direct Responses
Save credits by handling common queries directly:

- **Price queries**: "cheapest products", "most expensive"
- **Best sellers**: "popular products", "trending items" 
- **New arrivals**: "latest products", "what's new"
- **Greetings**: "hello", "hi", instant responses
- **Order status**: "track my order", "order status"

**Cost**: 0.1-0.5 credits (vs 1-3 credits for full AI)

### 2. Optimized AI Prompts
- **Concise system prompts** (truncated to essential info)
- **Limited conversation history** (last 3 exchanges only)
- **Focused product context** (top 3 Pinecone results)
- **Token estimation** and credit calculation

### 3. Smart Handoff System
When credits are exhausted:
- **Automatic handoff** to manual chat
- **Merchant notifications** via dashboard
- **User-friendly messages** explaining the transition
- **Preserved chat history** for seamless support

## 🛠️ API Endpoints

### For Merchants (Admin)
- **`GET /app/credits`** - Dashboard for credit management
- **`GET /api/credits`** - Credit status and analytics
- **`POST /api/credits`** - Update AI settings and preferences

### For Customers (Public)
- **`POST /api/chat/:shop/:email`** - Original chat API
- **`POST /api/chat/optimized/:shop/:email`** - New optimized chat API
- **`POST /api/chat/test`** - Test keyword responses and credit system

## 📈 Usage Analytics

The system tracks:
- **Total requests** per month
- **Unique users** served
- **Response types** (AI, Keyword, Manual)
- **Success rates** and error tracking
- **Token usage** and cost optimization
- **Response times** and performance metrics

## 🔧 Configuration

### Per-Shop Settings
```typescript
interface ChatConfiguration {
    aiEnabled: boolean;              // Manual AI on/off
    autoHandoffEnabled: boolean;     // Auto-switch to manual when credits low
    useKeywordResponses: boolean;    // Enable keyword optimization
    maxTokensPerResponse: number;    // Limit OpenAI tokens (default: 500)
    maxConcurrentRequests: number;   // Rate limiting (default: 5)
    rateLimitPerMinute: number;      // Requests per minute (default: 60)
}
```

## 🎮 Usage Examples

### 1. Check Credit Status
```typescript
const credits = await checkCreditsAvailable("store.myshopify.com");
console.log(credits);
// { hasCredits: true, remainingCredits: 750, canProcessRequest: true }
```

### 2. Test Keyword Response  
```typescript
const keyword = await checkKeywordResponse("store.myshopify.com", "hello");
console.log(keyword);
// { isKeywordMatch: true, response: "Hello! How can I help?", creditsUsed: 0.1 }
```

### 3. Record Usage
```typescript
await recordUsage("store.myshopify.com", {
    requestType: "AI_CHAT",
    creditsUsed: 2,
    tokensUsed: 1500,
    responseTime: 800,
    wasSuccessful: true
});
```

## 🔄 Migration from Old System

The new optimized API is backward compatible. You can:

1. **Keep using** `/api/chat/:shop/:email` (original)
2. **Gradually migrate** to `/api/chat/optimized/:shop/:email` 
3. **Test thoroughly** with `/api/chat/test`

## 🚨 Important Notes

- **OpenAI Model**: Updated to use `gpt-4` (instead of `gpt-4o-mini`) to match your working cURL
- **Token Optimization**: Prompts are now truncated and optimized
- **Credit Calculation**: 1 credit ≈ 1000 tokens of OpenAI usage
- **Auto-Handoff**: When credits reach 0, chat switches to manual mode
- **Load Balancing**: Built-in rate limiting and concurrent request management

## 🔮 Next Steps

1. **Run the initialization script**
2. **Update your frontend** to use the new optimized API
3. **Set up merchant billing** integration 
4. **Monitor usage** via the credits dashboard
5. **Configure keyword responses** for your specific use cases

## 🆘 Support

If you encounter issues:
1. Check the **credits dashboard** (`/app/credits`)
2. Test with the **test API** (`/api/chat/test`)
3. Review **usage logs** in the database
4. Verify **OpenAI API key** is working with `/api/test-openai`