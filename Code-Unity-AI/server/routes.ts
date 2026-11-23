import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { registerChatRoutes } from "./replit_integrations/chat";
import { db } from "./db";
import { algorithms } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register AI chat routes
  registerChatRoutes(app);

  // Algorithm CRUD routes
  app.get("/api/algorithms", async (req, res) => {
    try {
      const allAlgorithms = await db.select().from(algorithms).orderBy(desc(algorithms.createdAt));
      res.json(allAlgorithms);
    } catch (error) {
      console.error("Error fetching algorithms:", error);
      res.status(500).json({ error: "Failed to fetch algorithms" });
    }
  });

  app.get("/api/algorithms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [algorithm] = await db.select().from(algorithms).where(eq(algorithms.id, id));
      if (!algorithm) {
        return res.status(404).json({ error: "Algorithm not found" });
      }
      res.json(algorithm);
    } catch (error) {
      console.error("Error fetching algorithm:", error);
      res.status(500).json({ error: "Failed to fetch algorithm" });
    }
  });

  app.post("/api/algorithms", async (req, res) => {
    try {
      const { title, language, complexity, code, explanation } = req.body;
      const [algorithm] = await db.insert(algorithms).values({
        title,
        language,
        complexity,
        code,
        explanation: explanation || "",
        isFavorite: 0,
      }).returning();
      res.status(201).json(algorithm);
    } catch (error) {
      console.error("Error creating algorithm:", error);
      res.status(500).json({ error: "Failed to create algorithm" });
    }
  });

  app.patch("/api/algorithms/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isFavorite } = req.body;
      const [algorithm] = await db.update(algorithms)
        .set({ isFavorite: isFavorite ? 1 : 0 })
        .where(eq(algorithms.id, id))
        .returning();
      res.json(algorithm);
    } catch (error) {
      console.error("Error updating algorithm:", error);
      res.status(500).json({ error: "Failed to update algorithm" });
    }
  });

  app.delete("/api/algorithms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(algorithms).where(eq(algorithms.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting algorithm:", error);
      res.status(500).json({ error: "Failed to delete algorithm" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
