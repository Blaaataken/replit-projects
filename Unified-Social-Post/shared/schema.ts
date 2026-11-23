import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatarUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type SocialPlatform = "twitter" | "facebook" | "linkedin" | "instagram" | "threads";

export const socialAccountSchema = z.object({
  id: z.string(),
  platform: z.enum(["twitter", "facebook", "linkedin", "instagram", "threads"]),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  connected: z.boolean(),
  accessToken: z.string().optional(),
});

export type SocialAccount = z.infer<typeof socialAccountSchema>;

export const insertSocialAccountSchema = socialAccountSchema.omit({ id: true });
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;

export const postStatusSchema = z.enum(["draft", "scheduled", "published", "failed"]);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const postSchema = z.object({
  id: z.string(),
  content: z.string(),
  mediaUrls: z.array(z.string()).optional(),
  platforms: z.array(z.enum(["twitter", "facebook", "linkedin", "instagram", "threads"])),
  status: postStatusSchema,
  scheduledAt: z.string().optional(),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
});

export type Post = z.infer<typeof postSchema>;

export const insertPostSchema = postSchema.omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;

export const platformInfo: Record<SocialPlatform, { name: string; color: string; maxLength: number }> = {
  twitter: { name: "X (Twitter)", color: "#000000", maxLength: 280 },
  facebook: { name: "Facebook", color: "#1877F2", maxLength: 63206 },
  linkedin: { name: "LinkedIn", color: "#0A66C2", maxLength: 3000 },
  instagram: { name: "Instagram", color: "#E4405F", maxLength: 2200 },
  threads: { name: "Threads", color: "#000000", maxLength: 500 },
};
