import {
  type User,
  type InsertUser,
  type SocialAccount,
  type InsertSocialAccount,
  type Post,
  type InsertPost,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAccounts(): Promise<SocialAccount[]>;
  getAccount(id: string): Promise<SocialAccount | undefined>;
  createAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateAccount(id: string, account: Partial<SocialAccount>): Promise<SocialAccount | undefined>;
  deleteAccount(id: string): Promise<boolean>;

  getPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accounts: Map<string, SocialAccount>;
  private posts: Map<string, Post>;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.posts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      displayName: insertUser.displayName ?? null,
      email: insertUser.email ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  async getAccounts(): Promise<SocialAccount[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: string): Promise<SocialAccount | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const id = randomUUID();
    const account: SocialAccount = { ...insertAccount, id };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updates: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    const updated = { ...account, ...updates };
    this.accounts.set(id, updated);
    return updated;
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async getPosts(): Promise<Post[]> {
    const posts = Array.from(this.posts.values());
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      createdAt: new Date().toISOString(),
      publishedAt: insertPost.status === "published" ? new Date().toISOString() : undefined,
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    const updated = { ...post, ...updates };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }
}

export const storage = new MemStorage();
