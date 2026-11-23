import { type Config, type InsertConfig, type ReplitProject, type SyncHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getConfig(): Promise<Config | undefined>;
  saveConfig(config: InsertConfig): Promise<Config>;
  getProjects(): Promise<ReplitProject[]>;
  setProjects(projects: ReplitProject[]): Promise<void>;
  updateProjectStatus(projectId: string, status: ReplitProject["syncStatus"]): Promise<void>;
  getSyncHistory(): Promise<SyncHistory[]>;
  addSyncHistory(entry: Omit<SyncHistory, "id">): Promise<SyncHistory>;
}

export class MemStorage implements IStorage {
  private config: Config | undefined;
  private projects: Map<string, ReplitProject>;
  private syncHistory: SyncHistory[];

  constructor() {
    this.projects = new Map();
    this.syncHistory = [];
    this.config = {
      id: randomUUID(),
      replitConnected: false,
      githubConnected: false,
    };
  }

  async getConfig(): Promise<Config | undefined> {
    return this.config;
  }

  async saveConfig(insertConfig: InsertConfig): Promise<Config> {
    const config: Config = {
      id: this.config?.id || randomUUID(),
      ...insertConfig,
    };
    this.config = config;
    return config;
  }

  async getProjects(): Promise<ReplitProject[]> {
    return Array.from(this.projects.values());
  }

  async setProjects(projects: ReplitProject[]): Promise<void> {
    this.projects.clear();
    projects.forEach(p => this.projects.set(p.id, p));
  }

  async updateProjectStatus(projectId: string, status: ReplitProject["syncStatus"]): Promise<void> {
    const project = this.projects.get(projectId);
    if (project) {
      project.syncStatus = status;
      this.projects.set(projectId, project);
    }
  }

  async getSyncHistory(): Promise<SyncHistory[]> {
    return this.syncHistory.sort((a, b) => 
      new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime()
    );
  }

  async addSyncHistory(entry: Omit<SyncHistory, "id">): Promise<SyncHistory> {
    const historyEntry: SyncHistory = {
      ...entry,
      id: randomUUID(),
    };
    this.syncHistory.push(historyEntry);
    return historyEntry;
  }
}

export const storage = new MemStorage();
