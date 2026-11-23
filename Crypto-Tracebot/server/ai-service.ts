import OpenAI from "openai";
import type { AIInsight } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface MarketContext {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export async function generateMarketInsights(markets: MarketContext[]): Promise<AIInsight[]> {
  try {
    const prompt = `You are an expert cryptocurrency trading analyst. Analyze the following market data and provide trading insights for each cryptocurrency.

Market Data:
${markets.map(m => `
${m.symbol}:
- Current Price: $${m.price.toFixed(2)}
- 24h Change: ${m.change24h.toFixed(2)}%
- 24h Volume: $${(m.volume24h / 1000000000).toFixed(2)}B
- 24h High: $${m.high24h.toFixed(2)}
- 24h Low: $${m.low24h.toFixed(2)}
`).join('\n')}

For each cryptocurrency, provide:
1. A recommendation (buy, sell, or hold)
2. A confidence score (0-100)
3. A brief reasoning (max 100 characters)

Respond in JSON format with an array of objects with fields: symbol, recommendation, confidence, reasoning`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    const insights: AIInsight[] = (parsed.insights || parsed.data || []).map((item: {
      symbol: string;
      recommendation: string;
      confidence: number;
      reasoning: string;
    }, index: number) => ({
      id: `insight-${Date.now()}-${index}`,
      symbol: item.symbol,
      recommendation: item.recommendation as "buy" | "sell" | "hold",
      confidence: Math.min(100, Math.max(0, item.confidence)),
      reasoning: item.reasoning,
      timestamp: new Date(),
    }));

    return insights;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    // Return fallback insights if AI fails
    return markets.map((m, index) => ({
      id: `insight-${Date.now()}-${index}`,
      symbol: m.symbol,
      recommendation: m.change24h > 2 ? "sell" : m.change24h < -2 ? "buy" : "hold" as "buy" | "sell" | "hold",
      confidence: 60 + Math.random() * 20,
      reasoning: m.change24h > 2 
        ? "Overbought conditions detected, consider taking profits"
        : m.change24h < -2 
        ? "Oversold conditions, potential buying opportunity"
        : "Market consolidating, wait for clearer signals",
      timestamp: new Date(),
    }));
  }
}

export async function analyzeTrade(
  symbol: string,
  action: "buy" | "sell",
  price: number,
  amount: number
): Promise<{ approved: boolean; reason: string }> {
  try {
    const prompt = `You are a risk management AI for an aggressive crypto trading bot. 
    
A trade is proposed:
- Symbol: ${symbol}
- Action: ${action.toUpperCase()}
- Price: $${price}
- Amount: ${amount} units
- Total Value: $${(price * amount).toFixed(2)}

The bot uses an aggressive strategy with:
- 10% profit target
- 15% stop-loss

Should this trade be approved? Consider market conditions and risk/reward.
Respond in JSON format: { "approved": true/false, "reason": "brief explanation" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 256,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    
    return {
      approved: result.approved !== false,
      reason: result.reason || "Trade approved by AI risk management",
    };
  } catch (error) {
    console.error("Error analyzing trade:", error);
    return { approved: true, reason: "AI analysis unavailable, trade approved by default" };
  }
}
