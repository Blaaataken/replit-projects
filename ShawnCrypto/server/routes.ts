import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertTokenMetricsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to submit contact form" 
        });
      }
    }
  });

  // Get all contacts (for admin purposes)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch contacts" 
      });
    }
  });

  // Get current token metrics
  app.get("/api/token-metrics", async (req, res) => {
    try {
      const metrics = await storage.getTokenMetrics();
      if (!metrics) {
        res.status(404).json({ 
          success: false, 
          error: "Token metrics not found" 
        });
        return;
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch token metrics" 
      });
    }
  });

  // Update token metrics (for AI updates)
  app.put("/api/token-metrics", async (req, res) => {
    try {
      const metricsData = insertTokenMetricsSchema.parse(req.body);
      const metrics = await storage.updateTokenMetrics(metricsData);
      res.json({ success: true, metrics });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to update token metrics" 
        });
      }
    }
  });

  // AI value calculation endpoint
  app.post("/api/ai-calculate", async (req, res) => {
    try {
      const { amount, timeHorizon } = req.body;
      
      if (!amount || !timeHorizon) {
        res.status(400).json({ 
          success: false, 
          error: "Amount and time horizon are required" 
        });
        return;
      }

      // AI calculation logic (simplified)
      const baseMultiplier = 1 + (timeHorizon / 365) * 0.5;
      const aiBoost = 1 + Math.random() * 0.3;
      const projectedValue = amount * baseMultiplier * aiBoost;
      const returnPercentage = ((projectedValue - amount) / amount * 100);
      const confidenceLevel = Math.floor(Math.random() * 20 + 80); // 80-100%

      res.json({
        success: true,
        projection: {
          projectedValue: projectedValue.toFixed(2),
          returnPercentage: returnPercentage.toFixed(1),
          confidenceLevel,
          analysis: "Strong bullish signals detected across 12 networks with increasing adoption metrics."
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to calculate AI projection" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
