import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { generateRepoRequestSchema, createGithubRepoSchema, userUsage, generations, payments } from "@shared/schema";
import { getGitHubUser, createRepository } from "./github";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { stripeService } from "./stripeService";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault, verifyPaypalOrder } from "./paypal";
import { db } from "./db";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const FREE_GENERATIONS_LIMIT = 1;
const PAY_PER_BUILD_PRICE = 300;

// Helper to get user ID from request (handles both OIDC claims.sub and id)
function getUserId(req: any): string | null {
  const user = req.user;
  if (!user) return null;
  return user.claims?.sub || user.id || null;
}

async function getUserUsage(userId: string) {
  const [usage] = await db.select().from(userUsage).where(eq(userUsage.userId, userId));
  if (!usage) {
    const [newUsage] = await db.insert(userUsage).values({ userId }).returning();
    return newUsage;
  }
  return usage;
}

async function canGenerate(userId: string): Promise<{ allowed: boolean; reason?: string; usageType?: string }> {
  const usage = await getUserUsage(userId);
  
  if (usage.subscriptionStatus === 'active' && usage.subscriptionExpiresAt && usage.subscriptionExpiresAt > new Date()) {
    return { allowed: true, usageType: 'subscription' };
  }
  
  if (usage.paidGenerationsRemaining > 0) {
    return { allowed: true, usageType: 'paid' };
  }
  
  if (usage.freeGenerationsUsed < FREE_GENERATIONS_LIMIT) {
    return { allowed: true, usageType: 'free' };
  }
  
  return { allowed: false, reason: 'No generations remaining. Purchase a build or subscribe for unlimited access.' };
}

async function recordGeneration(userId: string, projectName: string, projectDescription: string, language: string, framework: string | undefined, usageType: string) {
  await db.insert(generations).values({
    userId,
    projectName,
    projectDescription,
    language,
    framework,
    paymentType: usageType,
  });
  
  const usage = await getUserUsage(userId);
  if (usageType === 'free') {
    await db.update(userUsage).set({ freeGenerationsUsed: usage.freeGenerationsUsed + 1, updatedAt: new Date() }).where(eq(userUsage.userId, userId));
  } else if (usageType === 'paid') {
    await db.update(userUsage).set({ paidGenerationsRemaining: usage.paidGenerationsRemaining - 1, updatedAt: new Date() }).where(eq(userUsage.userId, userId));
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  // GitHub user endpoint
  app.get("/api/github/user", async (req, res) => {
    try {
      const user = await getGitHubUser();
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: "GitHub not connected" });
    }
  });

  // User usage status endpoint
  app.get("/api/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      const usage = await getUserUsage(userId);
      const canGen = await canGenerate(userId);
      res.json({
        freeGenerationsUsed: usage.freeGenerationsUsed,
        freeGenerationsLimit: FREE_GENERATIONS_LIMIT,
        paidGenerationsRemaining: usage.paidGenerationsRemaining,
        subscriptionStatus: usage.subscriptionStatus,
        subscriptionExpiresAt: usage.subscriptionExpiresAt,
        canGenerate: canGen.allowed,
        reason: canGen.reason,
      });
    } catch (error) {
      console.error("Usage error:", error);
      res.status(500).json({ error: "Failed to get usage info" });
    }
  });

  // Stripe publishable key endpoint
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe config error:", error);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  // Create payment intent for pay-per-build
  app.post("/api/stripe/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      const stripe = await getUncachableStripeClient();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: PAY_PER_BUILD_PRICE,
        currency: 'usd',
        metadata: { userId, type: 'pay_per_build' },
        automatic_payment_methods: { enabled: true },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Payment intent error:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // Confirm payment and add generation credit
  app.post("/api/stripe/confirm-payment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      const { paymentIntentId } = req.body;
      
      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.userId === userId) {
        const usage = await getUserUsage(userId);
        await db.update(userUsage).set({ 
          paidGenerationsRemaining: usage.paidGenerationsRemaining + 1,
          updatedAt: new Date() 
        }).where(eq(userUsage.userId, userId));

        await db.insert(payments).values({
          userId,
          provider: 'stripe',
          type: 'one_time',
          amount: (PAY_PER_BUILD_PRICE / 100).toString(),
          status: 'completed',
          providerPaymentId: paymentIntentId,
          generationsGranted: 1,
        });

        res.json({ success: true, generationsAdded: 1 });
      } else {
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Generate repository endpoint - now requires auth and checks usage
  app.post("/api/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      const genCheck = await canGenerate(userId);
      if (!genCheck.allowed) {
        return res.status(402).json({ error: genCheck.reason });
      }

      const validatedData = generateRepoRequestSchema.parse(req.body);
      
      const prompt = `You are an expert software architect. Generate a complete repository structure for the following project:

Project Name: ${validatedData.projectName}
Description: ${validatedData.projectDescription}
Language: ${validatedData.language}
${validatedData.framework ? `Framework: ${validatedData.framework}` : ""}
${validatedData.features?.length ? `Features: ${validatedData.features.join(", ")}` : ""}

Generate a JSON response with the following structure:
{
  "name": "project-name",
  "description": "A brief description",
  "files": [
    {
      "name": "filename.ext",
      "type": "file",
      "content": "file content here"
    },
    {
      "name": "foldername",
      "type": "folder",
      "children": [
        { "name": "nested.ext", "type": "file", "content": "content" }
      ]
    }
  ],
  "readme": "# Project Name\\n\\nComplete README content in markdown format...",
  "suggestedFeatures": ["feature1", "feature2"]
}

IMPORTANT RULES:
1. Generate REAL, WORKING code - not placeholders
2. Include all necessary configuration files (package.json, tsconfig.json, etc.)
3. Follow best practices for the chosen language/framework
4. Include proper .gitignore
5. README should be comprehensive with installation, usage, and API docs
6. Include proper folder structure (src/, tests/, docs/, etc.)
7. Generate at least 5-10 essential files
8. All code must be syntactically correct and production-ready`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { 
            role: "system", 
            content: "You are an expert software architect that generates complete, production-ready repository structures. Always respond with valid JSON only, no markdown code blocks." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const generatedRepo = JSON.parse(content);
      
      await recordGeneration(
        userId,
        validatedData.projectName,
        validatedData.projectDescription,
        validatedData.language,
        validatedData.framework,
        genCheck.usageType!
      );
      
      res.json(generatedRepo);
    } catch (error) {
      console.error("Generate error:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to generate repository" });
      }
    }
  });

  // Create GitHub repository endpoint
  app.post("/api/github/create", async (req, res) => {
    try {
      const validatedData = createGithubRepoSchema.parse(req.body);
      
      const repo = await createRepository(
        validatedData.name,
        validatedData.description || "",
        validatedData.files,
        validatedData.isPrivate
      );

      res.json(repo);
    } catch (error) {
      console.error("GitHub create error:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create GitHub repository" });
      }
    }
  });

  // PayPal routes for subscription payments
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // PayPal subscription confirmation - verify payment with PayPal API and add subscription
  app.post("/api/paypal/confirm-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Missing order ID" });
      }

      // Check if this order was already used
      const existingPayment = await db.select().from(payments)
        .where(eq(payments.providerPaymentId, orderId));
      
      if (existingPayment.length > 0) {
        return res.status(400).json({ error: "This payment has already been processed" });
      }

      // Server-side verification: Check order status with PayPal API
      const verification = await verifyPaypalOrder(orderId);
      
      if (!verification.verified) {
        return res.status(400).json({ 
          error: `Payment not verified. Status: ${verification.status}` 
        });
      }

      // Verify the amount is correct ($15.00 for subscription)
      if (verification.amount !== '15.00') {
        return res.status(400).json({ 
          error: `Invalid payment amount: ${verification.amount}` 
        });
      }
      
      const usage = await getUserUsage(userId);
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      await db.update(userUsage).set({ 
        subscriptionStatus: 'active',
        subscriptionId: orderId,
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date() 
      }).where(eq(userUsage.userId, userId));

      await db.insert(payments).values({
        userId,
        provider: 'paypal',
        type: 'subscription',
        amount: '15.00',
        status: 'completed',
        providerPaymentId: orderId,
        generationsGranted: 0,
      });

      res.json({ success: true, subscriptionActive: true, expiresAt });
    } catch (error) {
      console.error("PayPal confirm error:", error);
      res.status(500).json({ error: "Failed to confirm subscription" });
    }
  });

  return httpServer;
}
