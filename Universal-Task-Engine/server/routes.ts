import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `You are Nexus AI, an advanced intelligent assistant designed to help users understand and complete complex tasks. Your capabilities include:

1. **Task Breakdown**: Breaking complex projects into manageable, actionable steps
2. **Problem Solving**: Analyzing problems and providing structured solutions
3. **Explanation**: Making difficult concepts easy to understand
4. **Planning**: Creating detailed plans and roadmaps
5. **Guidance**: Providing step-by-step instructions

Guidelines:
- Be thorough yet concise in your responses
- Use clear formatting with headers, bullet points, and numbered lists when helpful
- Ask clarifying questions if the user's request is ambiguous
- Provide practical, actionable advice
- Be encouraging and supportive
- If you don't know something, admit it honestly

Always aim to empower users to accomplish their goals efficiently and effectively.`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await storage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const parseResult = insertConversationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request body",
          details: parseResult.error.issues 
        });
      }

      const conversation = await storage.createConversation(parseResult.data);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get streaming AI response
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      // Validate using shared schema - just the content part
      const messageData = {
        conversationId,
        role: "user",
        content: req.body.content,
      };

      const parseResult = insertMessageSchema.safeParse(messageData);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request body",
          details: parseResult.error.issues 
        });
      }

      // Verify conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Save user message
      await storage.createMessage(parseResult.data);

      // Get conversation history for context
      const messages = await storage.getMessagesByConversation(conversationId);
      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Set up SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  return httpServer;
}
