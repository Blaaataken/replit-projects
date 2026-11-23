import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  users,
  conversations,
  messages,
  goals,
  userPreferences,
  learnedPatterns,
  suggestions,
  type User,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Goal,
  type InsertGoal,
  type UserPreferences,
  type InsertUserPreferences,
  type LearnedPattern,
  type InsertLearnedPattern,
  type Suggestion,
  type InsertSuggestion,
} from "@shared/schema";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Conversation operations
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<void>;

  // Message operations
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Goal operations
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<void>;

  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;

  // Learned patterns operations
  getLearnedPatterns(userId: string): Promise<LearnedPattern[]>;
  createLearnedPattern(pattern: InsertLearnedPattern): Promise<LearnedPattern>;
  updateLearnedPattern(id: string, data: Partial<InsertLearnedPattern>): Promise<LearnedPattern | undefined>;

  // Suggestions operations
  getSuggestions(userId: string): Promise<Suggestion[]>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  updateSuggestion(id: string, data: Partial<InsertSuggestion>): Promise<Suggestion | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async getConversations(userId: string): Promise<Conversation[]> {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation).returning();
    return created;
  }

  async updateConversation(id: string, data: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updated] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  // Message operations
  async getMessages(conversationId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  // Goal operations
  async getGoals(userId: string): Promise<Goal[]> {
    return db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
    return goal;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [created] = await db.insert(goals).values(goal).returning();
    return created;
  }

  async updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return updated;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return prefs;
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [prefs] = await db
      .insert(userPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() },
      })
      .returning();
    return prefs;
  }

  // Learned patterns operations
  async getLearnedPatterns(userId: string): Promise<LearnedPattern[]> {
    return db
      .select()
      .from(learnedPatterns)
      .where(eq(learnedPatterns.userId, userId))
      .orderBy(desc(learnedPatterns.confidence));
  }

  async createLearnedPattern(pattern: InsertLearnedPattern): Promise<LearnedPattern> {
    const [created] = await db.insert(learnedPatterns).values(pattern).returning();
    return created;
  }

  async updateLearnedPattern(id: string, data: Partial<InsertLearnedPattern>): Promise<LearnedPattern | undefined> {
    const [updated] = await db
      .update(learnedPatterns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learnedPatterns.id, id))
      .returning();
    return updated;
  }

  // Suggestions operations
  async getSuggestions(userId: string): Promise<Suggestion[]> {
    return db
      .select()
      .from(suggestions)
      .where(eq(suggestions.userId, userId))
      .orderBy(desc(suggestions.createdAt));
  }

  async createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    const [created] = await db.insert(suggestions).values(suggestion).returning();
    return created;
  }

  async updateSuggestion(id: string, data: Partial<InsertSuggestion>): Promise<Suggestion | undefined> {
    const [updated] = await db
      .update(suggestions)
      .set(data)
      .where(eq(suggestions.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
