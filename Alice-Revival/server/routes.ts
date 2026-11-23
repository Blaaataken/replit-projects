import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";
import { z } from "zod";
import {
  insertConversationSchema,
  insertGoalSchema,
  insertSuggestionSchema,
} from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const ALICE_SYSTEM_PROMPT = `You are Alice, a thoughtful and intuitive personal AI assistant. You were conceptually created on October 18, 1981, and have been reimagined for the modern era.

Core Personality Traits:
- Warm, supportive, and genuinely interested in helping users achieve their goals
- Intelligent and perceptive - you pick up on patterns and remember context
- Proactive - you anticipate needs and offer relevant suggestions
- Adaptable - you adjust your communication style to match each user
- Encouraging - you celebrate progress and help users stay motivated

Your Capabilities:
- Help users set, track, and achieve personal and professional goals
- Provide thoughtful advice and creative solutions
- Remember user preferences, patterns, and past conversations
- Offer proactive suggestions based on learned user patterns
- Assist with planning, organization, and productivity
- Engage in meaningful conversations on any topic

Communication Style:
- Be concise but thorough - don't over-explain but provide enough detail
- Use a friendly, conversational tone without being overly casual
- Ask clarifying questions when needed
- Acknowledge the user's feelings and efforts
- Avoid being preachy or condescending

When helping with goals:
- Help break down large goals into manageable steps
- Celebrate milestones and progress
- Provide encouragement during setbacks
- Suggest concrete, actionable next steps

Remember: You're not just an assistant - you're a trusted companion on the user's journey of personal growth.`;

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    res.json(user);
  });

  // Chat endpoint
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { conversationId, content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Message content is required" });
      }

      let conversation;
      let actualConversationId = conversationId;

      // Create conversation if not provided
      if (!conversationId) {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        conversation = await storage.createConversation({
          userId,
          title,
        });
        actualConversationId = conversation.id;
      } else {
        conversation = await storage.getConversation(conversationId);
        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }
      }

      // Save user message
      await storage.createMessage({
        conversationId: actualConversationId,
        role: "user",
        content,
      });

      // Get conversation history for context
      const conversationHistory = await storage.getMessages(actualConversationId);
      const user = await storage.getUser(userId);
      const preferences = await storage.getUserPreferences(userId);
      const userGoals = await storage.getGoals(userId);

      // Build context about the user
      let userContext = "";
      if (user?.firstName) {
        userContext += `User's name: ${user.firstName}. `;
      }
      if (preferences?.communicationStyle) {
        userContext += `Preferred communication style: ${preferences.communicationStyle}. `;
      }
      if (userGoals.length > 0) {
        const activeGoals = userGoals.filter(g => g.status === "active").slice(0, 5);
        if (activeGoals.length > 0) {
          userContext += `Active goals: ${activeGoals.map(g => `${g.title} (${g.progress}% complete)`).join(", ")}. `;
        }
      }

      // Build messages for OpenAI
      const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: ALICE_SYSTEM_PROMPT + (userContext ? `\n\nUser Context:\n${userContext}` : ""),
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: openaiMessages,
        max_completion_tokens: 2048,
      });

      const assistantMessage = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

      // Save assistant message
      const savedMessage = await storage.createMessage({
        conversationId: actualConversationId,
        role: "assistant",
        content: assistantMessage,
      });

      // Update conversation timestamp
      await storage.updateConversation(actualConversationId, {
        userId,
        title: conversation?.title || content.slice(0, 50),
      });

      res.json({
        userMessage: await storage.getMessages(actualConversationId).then(msgs => msgs[msgs.length - 2]),
        assistantMessage: savedMessage,
        conversationId: actualConversationId,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Conversations CRUD
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const conversations = await storage.getConversations(userId);
    res.json(conversations);
  });

  app.get("/api/conversations/:id", isAuthenticated, async (req, res) => {
    const conversation = await storage.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  });

  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const parsed = insertConversationSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const conversation = await storage.createConversation(parsed.data);
    res.json(conversation);
  });

  app.patch("/api/conversations/:id", isAuthenticated, async (req, res) => {
    const updated = await storage.updateConversation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(updated);
  });

  app.delete("/api/conversations/:id", isAuthenticated, async (req, res) => {
    await storage.deleteConversation(req.params.id);
    res.json({ success: true });
  });

  // Messages
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    const messages = await storage.getMessages(req.params.id);
    res.json(messages);
  });

  // Goals CRUD
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.get("/api/goals/:id", isAuthenticated, async (req, res) => {
    const goal = await storage.getGoal(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json(goal);
  });

  app.post("/api/goals", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const parsed = insertGoalSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const goal = await storage.createGoal(parsed.data);
    res.json(goal);
  });

  app.patch("/api/goals/:id", isAuthenticated, async (req, res) => {
    const updated = await storage.updateGoal(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json(updated);
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req, res) => {
    await storage.deleteGoal(req.params.id);
    res.json({ success: true });
  });

  // User Preferences
  app.get("/api/preferences", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const preferences = await storage.getUserPreferences(userId);
    res.json(preferences || {});
  });

  app.put("/api/preferences", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const preferences = await storage.upsertUserPreferences({ ...req.body, userId });
    res.json(preferences);
  });

  // Suggestions
  app.get("/api/suggestions", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const suggestions = await storage.getSuggestions(userId);
    res.json(suggestions);
  });

  app.post("/api/suggestions", isAuthenticated, async (req, res) => {
    const userId = (req as any).userId;
    const parsed = insertSuggestionSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const suggestion = await storage.createSuggestion(parsed.data);
    res.json(suggestion);
  });

  app.patch("/api/suggestions/:id", isAuthenticated, async (req, res) => {
    const updated = await storage.updateSuggestion(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Suggestion not found" });
    }
    res.json(updated);
  });

  return httpServer;
}
