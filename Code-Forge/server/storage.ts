import { type FileNode } from "@shared/schema";
import { randomUUID } from "crypto";

export interface GeneratedRepoRecord {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  files: FileNode[];
  readme: string;
  githubUrl?: string;
  createdAt: Date;
}

export interface IStorage {
  saveGeneratedRepo(repo: Omit<GeneratedRepoRecord, 'id' | 'createdAt'>): Promise<GeneratedRepoRecord>;
  getGeneratedRepo(id: string): Promise<GeneratedRepoRecord | undefined>;
  getAllGeneratedRepos(): Promise<GeneratedRepoRecord[]>;
}

export class MemStorage implements IStorage {
  private repos: Map<string, GeneratedRepoRecord>;

  constructor() {
    this.repos = new Map();
  }

  async saveGeneratedRepo(repo: Omit<GeneratedRepoRecord, 'id' | 'createdAt'>): Promise<GeneratedRepoRecord> {
    const id = randomUUID();
    const record: GeneratedRepoRecord = {
      ...repo,
      id,
      createdAt: new Date(),
    };
    this.repos.set(id, record);
    return record;
  }

  async getGeneratedRepo(id: string): Promise<GeneratedRepoRecord | undefined> {
    return this.repos.get(id);
  }

  async getAllGeneratedRepos(): Promise<GeneratedRepoRecord[]> {
    return Array.from(this.repos.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
