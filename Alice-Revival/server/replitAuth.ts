import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Type for authenticated request
declare module "express" {
  interface Request {
    userId?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
  const pgStore = connectPg(session);
  return session({
    secret: process.env.SESSION_SECRET || "alice-secret-key-change-in-production",
    store: new pgStore({
      pool: pool,
      createTableIfMissing: true,
      tableName: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login route - redirect to Replit login
  app.get("/api/login", (req, res) => {
    const replitUserHeader = req.headers["x-replit-user-id"];
    if (replitUserHeader) {
      res.redirect("/");
    } else {
      // For local development or when Replit headers aren't available
      res.redirect("https://replit.com/auth_with_repl_site?domain=" + req.headers.host);
    }
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    (req.session as any).destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });

  // Auth middleware for routes
  app.use(async (req, res, next) => {
    const replitUserId = req.headers["x-replit-user-id"] as string | undefined;
    const replitUserName = req.headers["x-replit-user-name"] as string | undefined;
    const replitProfileImage = req.headers["x-replit-user-profile-image"] as string | undefined;

    if (replitUserId) {
      try {
        // Upsert the user
        const user = await storage.upsertUser({
          id: replitUserId,
          firstName: replitUserName || undefined,
          profileImageUrl: replitProfileImage || undefined,
        });
        (req as any).userId = user.id;
        (req.session as any).userId = user.id;
      } catch (error) {
        console.error("Error upserting user:", error);
      }
    } else if ((req.session as any).userId) {
      (req as any).userId = (req.session as any).userId;
    }
    next();
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req as any).userId) {
    next();
  } else {
    res.status(401).json({ error: "401: Unauthorized" });
  }
};
