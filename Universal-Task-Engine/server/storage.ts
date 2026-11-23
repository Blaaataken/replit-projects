import type { InsertConversation, InsertMessage, ConversationResponse, MessageResponse } from "@shared/schema";

export interface IStorage {
  // Conversations
  getConversation(id: number): Promise<ConversationResponse | undefined>;
  getAllConversations(): Promise<ConversationResponse[]>;
  createConversation(data: InsertConversation): Promise<ConversationResponse>;
  deleteConversation(id: number): Promise<void>;

  // Messages
  getMessagesByConversation(conversationId: number): Promise<MessageResponse[]>;
  createMessage(data: InsertMessage): Promise<MessageResponse>;
}

interface StoredConversation {
  id: number;
  title: string;
  createdAt: Date;
}

interface StoredMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: Date;
}

function toConversationResponse(c: StoredConversation): ConversationResponse {
  return {
    id: c.id,
    title: c.title,
    createdAt: c.createdAt.toISOString(),
  };
}

function toMessageResponse(m: StoredMessage): MessageResponse {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  };
}

export class MemStorage implements IStorage {
  private conversations: Map<number, StoredConversation>;
  private messages: Map<number, StoredMessage>;
  private nextConversationId: number;
  private nextMessageId: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.nextConversationId = 1;
    this.nextMessageId = 1;
  }

  async getConversation(id: number): Promise<ConversationResponse | undefined> {
    const conversation = this.conversations.get(id);
    return conversation ? toConversationResponse(conversation) : undefined;
  }

  async getAllConversations(): Promise<ConversationResponse[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(toConversationResponse);
  }

  async createConversation(data: InsertConversation): Promise<ConversationResponse> {
    const id = this.nextConversationId++;
    const conversation: StoredConversation = {
      id,
      title: data.title,
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return toConversationResponse(conversation);
  }

  async deleteConversation(id: number): Promise<void> {
    this.conversations.delete(id);
    // Also delete associated messages
    for (const [messageId, message] of this.messages.entries()) {
      if (message.conversationId === id) {
        this.messages.delete(messageId);
      }
    }
  }

  async getMessagesByConversation(conversationId: number): Promise<MessageResponse[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(toMessageResponse);
  }

  async createMessage(data: InsertMessage): Promise<MessageResponse> {
    const id = this.nextMessageId++;
    const message: StoredMessage = {
      id,
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return toMessageResponse(message);
  }
}

export const storage = new MemStorage();
