import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
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

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await storage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content, media } = req.body;

      await storage.createMessage({
        conversationId,
        role: "user",
        content,
        mediaType: media?.type || null,
        mediaData: media?.data || null,
      });

      const conversationMessages = await storage.getMessagesByConversation(conversationId);
      
      const relevantKnowledge = await storage.searchKnowledge(content);
      let systemContext = "";
      if (relevantKnowledge.length > 0) {
        systemContext = `You have learned the following information from previous conversations that may be relevant:\n${relevantKnowledge.map(k => `- ${k.topic}: ${k.content}`).join("\n")}\n\nUse this context to provide better, more personalized responses when relevant.`;
      }

      const chatMessages: Array<{ role: "user" | "model"; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];
      
      if (systemContext) {
        chatMessages.push({
          role: "user",
          parts: [{ text: `System context: ${systemContext}` }],
        });
        chatMessages.push({
          role: "model",
          parts: [{ text: "I understand. I'll incorporate this learned knowledge into my responses when relevant." }],
        });
      }

      for (const msg of conversationMessages) {
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
        
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        
        if (msg.mediaData && msg.mediaType) {
          const base64Data = msg.mediaData.split(",")[1] || msg.mediaData;
          parts.push({
            inlineData: {
              mimeType: msg.mediaType,
              data: base64Data,
            },
          });
        }
        
        chatMessages.push({
          role: msg.role === "user" ? "user" : "model",
          parts,
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
        const stream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: chatMessages,
          config: {
            systemInstruction: "You are Nexus AI, an enhanced AI assistant that continuously learns and adapts. You have the ability to process text, voice transcriptions, and analyze images/videos. Be helpful, insightful, and always aim to provide valuable information. When you encounter new important information that could be useful in future conversations, mentally note it as something worth remembering. Be conversational but thorough.",
          },
        });

        let fullResponse = "";

        for await (const chunk of stream) {
          const text = chunk.text || "";
          if (text) {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }

        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: fullResponse,
          mediaType: null,
          mediaData: null,
        });

        const lowerContent = content.toLowerCase();
        const lowerResponse = fullResponse.toLowerCase();
        const shouldLearn = 
          lowerContent.includes("remember") ||
          lowerContent.includes("note that") ||
          lowerContent.includes("keep in mind") ||
          lowerContent.includes("my name is") ||
          lowerContent.includes("i prefer") ||
          lowerContent.includes("i like") ||
          lowerContent.includes("i work") ||
          lowerResponse.includes("i'll remember") ||
          lowerResponse.includes("i've noted");

        if (shouldLearn && content.length > 10) {
          const topic = content.slice(0, 50);
          await storage.createKnowledge({
            topic,
            content: content,
            source: "conversation",
            conversationId,
          });
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  app.get("/api/knowledge", async (req: Request, res: Response) => {
    try {
      const knowledge = await storage.getKnowledgeEntries();
      res.json(knowledge);
    } catch (error) {
      console.error("Error fetching knowledge:", error);
      res.status(500).json({ error: "Failed to fetch knowledge" });
    }
  });

  app.get("/api/knowledge/count", async (req: Request, res: Response) => {
    try {
      const count = await storage.getKnowledgeCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching knowledge count:", error);
      res.status(500).json({ error: "Failed to fetch knowledge count" });
    }
  });

  app.post("/api/knowledge", async (req: Request, res: Response) => {
    try {
      const { topic, content, source, conversationId } = req.body;
      const entry = await storage.createKnowledge({
        topic,
        content,
        source,
        conversationId,
      });
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating knowledge:", error);
      res.status(500).json({ error: "Failed to create knowledge" });
    }
  });

  return httpServer;
}
