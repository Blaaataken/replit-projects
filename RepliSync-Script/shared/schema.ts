import { z } from "zod";

export const configSchema = z.object({
  id: z.string(),
  replitToken: z.string().optional(),
  githubToken: z.string().optional(),
  githubUsername: z.string().optional(),
  replitConnected: z.boolean().default(false),
  githubConnected: z.boolean().default(false),
});

export const insertConfigSchema = configSchema.omit({ id: true });

export type Config = z.infer<typeof configSchema>;
export type InsertConfig = z.infer<typeof insertConfigSchema>;

export const replitProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastModified: z.string(),
  fileCount: z.number(),
  syncStatus: z.enum(["synced", "pending", "error", "not_synced"]).default("not_synced"),
});

export type ReplitProject = z.infer<typeof replitProjectSchema>;

export const syncHistorySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  status: z.enum(["success", "error", "in_progress"]),
  message: z.string().optional(),
  syncedAt: z.string(),
});

export type SyncHistory = z.infer<typeof syncHistorySchema>;

export const syncRequestSchema = z.object({
  projectIds: z.array(z.string()),
});

export type SyncRequest = z.infer<typeof syncRequestSchema>;

export const users = null;
export type User = { id: string; username: string; password: string };
export type InsertUser = Omit<User, "id">;
