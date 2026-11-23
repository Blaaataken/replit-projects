import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TradingSignalRequest {
  symbol: string;
  currentPrice: number;
  volume24h?: number;
  change24h?: number;
}

export interface TradingSignalResponse {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  targetPrice: string;
  reasoning: string;
}

export interface GasOptimizationRequest {
  fromNetwork: string;
  toNetwork: string;
  amount: number;
}

export interface GasOptimizationResponse {
  recommendedRoute: string;
  estimatedFee: number;
  estimatedTime: string;
  alternatives: Array<{
    route: string;
    fee: number;
    time: string;
  }>;
}

export async function generateTradingSignal(
  request: TradingSignalRequest
): Promise<TradingSignalResponse> {
  try {
    const prompt = `Analyze the following cryptocurrency trading data and provide a trading recommendation:

Symbol: ${request.symbol}
Current Price: $${request.currentPrice}
24h Volume: ${request.volume24h ? `$${request.volume24h}` : "N/A"}
24h Change: ${request.change24h !== undefined ? `${request.change24h}%` : "N/A"}

Provide your analysis in the following JSON format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": <number between 0-100>,
  "targetPrice": "<price as string>",
  "reasoning": "<detailed explanation of your recommendation>"
}

Base your recommendation on technical analysis, market sentiment, and risk assessment.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are an expert cryptocurrency trading analyst with deep knowledge of technical analysis, market trends, and risk management. Provide clear, actionable trading signals with detailed reasoning.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      action: result.action || "HOLD",
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      targetPrice: result.targetPrice || request.currentPrice.toString(),
      reasoning: result.reasoning || "Analysis pending",
    };
  } catch (error) {
    console.error("Error generating trading signal:", error);
    return {
      action: "HOLD",
      confidence: 0,
      targetPrice: request.currentPrice.toString(),
      reasoning: "Unable to generate signal at this time. Please try again later.",
    };
  }
}

export async function optimizeGasFees(
  request: GasOptimizationRequest
): Promise<GasOptimizationResponse> {
  try {
    const prompt = `Analyze cross-chain transaction routing and recommend the most cost-effective path:

From Network: ${request.fromNetwork}
To Network: ${request.toNetwork}
Amount: ${request.amount}

Consider:
1. Current gas prices on each network
2. Bridge fees
3. Transaction speed
4. Network congestion

Provide your analysis in the following JSON format:
{
  "recommendedRoute": "<network name>",
  "estimatedFee": <fee in USD>,
  "estimatedTime": "<time estimate>",
  "alternatives": [
    {
      "route": "<alternative route>",
      "fee": <fee in USD>,
      "time": "<time estimate>"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in blockchain networks and cross-chain transactions. Provide optimal routing recommendations that minimize costs while maintaining security and speed.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      recommendedRoute: result.recommendedRoute || "Polygon",
      estimatedFee: result.estimatedFee || 0.5,
      estimatedTime: result.estimatedTime || "2-3 min",
      alternatives: result.alternatives || [],
    };
  } catch (error) {
    console.error("Error optimizing gas fees:", error);
    return {
      recommendedRoute: "Polygon",
      estimatedFee: 0.5,
      estimatedTime: "2-3 min",
      alternatives: [],
    };
  }
}
