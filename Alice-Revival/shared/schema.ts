import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversations table - stores chat sessions
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table - stores individual chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals table - user goals that Alice helps track
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  progress: integer("progress").notNull().default(0), // 0-100
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'completed', 'paused'
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences - learned patterns and settings
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  communicationStyle: varchar("communication_style", { length: 50 }).default("friendly"), // 'formal', 'friendly', 'concise'
  voiceEnabled: boolean("voice_enabled").default(true),
  proactiveSuggestions: boolean("proactive_suggestions").default(true),
  focusAreas: text("focus_areas").array(), // Array of focus area strings
  timezone: varchar("timezone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learned patterns - what Alice has learned about the user
export const learnedPatterns = pgTable("learned_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  patternType: varchar("pattern_type", { length: 50 }).notNull(), // 'preference', 'habit', 'interest', 'behavior'
  patternKey: varchar("pattern_key", { length: 100 }).notNull(),
  patternValue: text("pattern_value").notNull(),
  confidence: integer("confidence").notNull().default(50), // 0-100 confidence level
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Proactive suggestions - Alice's recommendations
export const suggestions = pgTable("suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }), // 'goal', 'task', 'insight', 'reminder'
  priority: varchar("priority", { length: 20 }).default("medium"), // 'low', 'medium', 'high'
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'accepted', 'dismissed'
  relatedGoalId: varchar("related_goal_id").references(() => goals.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  conversations: many(conversations),
  goals: many(goals),
  preferences: one(userPreferences),
  patterns: many(learnedPatterns),
  suggestions: many(suggestions),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  suggestions: many(suggestions),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const learnedPatternsRelations = relations(learnedPatterns, ({ one }) => ({
  user: one(users, { fields: [learnedPatterns.userId], references: [users.id] }),
}));

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  user: one(users, { fields: [suggestions.userId], references: [users.id] }),
  relatedGoal: one(goals, { fields: [suggestions.relatedGoalId], references: [goals.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLearnedPatternSchema = createInsertSchema(learnedPatterns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSuggestionSchema = createInsertSchema(suggestions).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertLearnedPattern = z.infer<typeof insertLearnedPatternSchema>;
export type LearnedPattern = typeof learnedPatterns.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type Suggestion = typeof suggestions.$inferSelect;
