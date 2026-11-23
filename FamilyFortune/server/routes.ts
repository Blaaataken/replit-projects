import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProductSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import express from "express";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";

// File upload configuration
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

let stripe: any = null;

// Initialize Stripe if available
async function initializeStripe() {
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = await import("stripe");
      stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });
    }
  } catch (error) {
    console.warn("Stripe not available - payments disabled");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  await initializeStripe();

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const { sellerId } = req.query;
      const products = await storage.getProducts(sellerId as string);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, upload.fields([
    { name: 'productFiles', maxCount: 10 },
    { name: 'previewImage', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
        price: req.body.price,
      });

      const product = await storage.createProduct(productData);

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Save product files
      if (files.productFiles) {
        for (const file of files.productFiles) {
          const fileName = `${randomUUID()}-${file.originalname}`;
          const filePath = path.join('uploads', fileName);
          
          // Move file to permanent location
          fs.renameSync(file.path, path.join(process.cwd(), filePath));

          await storage.createProductFile({
            productId: product.id,
            fileName,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            filePath,
          });
        }
      }

      // Handle preview image
      if (files.previewImage && files.previewImage[0]) {
        const file = files.previewImage[0];
        const fileName = `preview-${randomUUID()}-${file.originalname}`;
        const filePath = path.join('uploads', fileName);
        
        fs.renameSync(file.path, path.join(process.cwd(), filePath));
        
        await storage.updateProduct(product.id, {
          previewImageUrl: `/uploads/${fileName}`,
        });
      }

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const product = await storage.getProduct(req.params.id);
      
      if (!product || product.sellerId !== userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      const updateData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, updateData);
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const product = await storage.getProduct(req.params.id);
      
      if (!product || product.sellerId !== userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete associated files
      const files = await storage.getProductFiles(req.params.id);
      for (const file of files) {
        const fullPath = path.join(process.cwd(), file.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Orders
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;
      
      let orders;
      if (type === 'sales') {
        orders = await storage.getOrders(userId); // Orders where user is seller
      } else {
        orders = await storage.getOrders(undefined, userId); // Orders where user is customer
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Analytics
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getSalesAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get Stripe publishable key
  app.get('/api/stripe/publishable-key', async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error fetching Stripe publishable key:", error);
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  // Stripe payment routes
  if (stripe) {
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { productId } = req.body;
        const product = await storage.getProduct(productId);
        
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(Number(product.price) * 100), // Convert to cents
          currency: "usd",
          metadata: {
            productId: product.id,
            sellerId: product.sellerId,
          },
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });

    // Stripe webhook to handle successful payments
    app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err: any) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { productId, sellerId } = paymentIntent.metadata;

        // Create order record
        await storage.createOrder({
          customerId: paymentIntent.customer as string || 'anonymous',
          productId,
          sellerId,
          stripePaymentIntentId: paymentIntent.id,
          amount: (paymentIntent.amount / 100).toString(),
          status: 'completed',
        });

        // Increment download count
        const product = await storage.getProduct(productId);
        if (product) {
          await storage.updateProduct(productId, {
            downloadCount: product.downloadCount + 1,
          });
        }
      }

      res.json({ received: true });
    });
  }

  // File download route (protected)
  app.get('/api/download/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const orders = await storage.getOrders();
      const order = orders.find(o => o.downloadToken === token);

      if (!order) {
        return res.status(404).json({ message: "Invalid download token" });
      }

      if (order.downloadExpiresAt && new Date() > new Date(order.downloadExpiresAt)) {
        return res.status(410).json({ message: "Download link expired" });
      }

      if (order.downloadCount >= order.maxDownloads) {
        return res.status(429).json({ message: "Download limit exceeded" });
      }

      const files = await storage.getProductFiles(order.productId);
      if (files.length === 0) {
        return res.status(404).json({ message: "No files found" });
      }

      // For simplicity, return first file (in real app, might create ZIP)
      const file = files[0];
      const filePath = path.join(process.cwd(), file.filePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // Increment download count
      await storage.updateOrder(order.id, {
        downloadCount: order.downloadCount + 1,
      });

      res.download(filePath, file.originalName);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Reviews
  app.post('/api/products/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: req.params.id,
        customerId: userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
