import { 
  users, 
  conversations, 
  messages, 
  knowledgeEntries,
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type KnowledgeEntry,
  type InsertKnowledge
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  updateConversationTitle(id: number, title: string): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<void>;
  
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  
  getKnowledgeEntries(): Promise<KnowledgeEntry[]>;
  getKnowledgeCount(): Promise<number>;
  createKnowledge(data: InsertKnowledge): Promise<KnowledgeEntry>;
  searchKnowledge(query: string): Promise<KnowledgeEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getAllConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async createConversation(title: string): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  }

  async updateConversationTitle(id: number, title: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ title })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  async getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
    return db.select().from(knowledgeEntries).orderBy(desc(knowledgeEntries.createdAt));
  }

  async getKnowledgeCount(): Promise<number> {
    const result = await db.select().from(knowledgeEntries);
    return result.length;
  }

  async createKnowledge(data: InsertKnowledge): Promise<KnowledgeEntry> {
    const [entry] = await db.insert(knowledgeEntries).values(data).returning();
    return entry;
  }

  async searchKnowledge(query: string): Promise<KnowledgeEntry[]> {
    const allKnowledge = await db.select().from(knowledgeEntries);
    const queryLower = query.toLowerCase();
    return allKnowledge.filter(
      (k) =>
        k.topic.toLowerCase().includes(queryLower) ||
        k.content.toLowerCase().includes(queryLower)
    );
  }
}

export const storage = new DatabaseStorage();
