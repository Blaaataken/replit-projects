import { contacts, tokenMetrics, users, type User, type InsertUser, type Contact, type InsertContact, type TokenMetrics, type InsertTokenMetrics } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getTokenMetrics(): Promise<TokenMetrics | undefined>;
  updateTokenMetrics(metrics: InsertTokenMetrics): Promise<TokenMetrics>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getTokenMetrics(): Promise<TokenMetrics | undefined> {
    const [metrics] = await db.select().from(tokenMetrics).limit(1);
    return metrics || undefined;
  }

  async updateTokenMetrics(metrics: InsertTokenMetrics): Promise<TokenMetrics> {
    // Try to update existing record first
    const existing = await this.getTokenMetrics();
    
    if (existing) {
      const [updated] = await db
        .update(tokenMetrics)
        .set(metrics)
        .where(eq(tokenMetrics.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new record if none exists
      const [created] = await db
        .insert(tokenMetrics)
        .values(metrics)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
