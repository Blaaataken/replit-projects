import { memo } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageResponse } from "@shared/schema";

interface ChatMessageProps {
  message: MessageResponse;
  isStreaming?: boolean;
}

export const ChatMessage = memo(function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary ai-pulse" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-card-border"
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreaming && !isUser && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/60 animate-pulse" />
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
});

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-4" data-testid="typing-indicator">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary ai-pulse" />
      </div>
      <div className="bg-card border border-card-border rounded-lg px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 typing-dot" />
        </div>
      </div>
    </div>
  );
}

export function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-3 px-4 py-4" data-testid="streaming-message">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary ai-pulse" />
      </div>
      <div className="max-w-[75%] bg-card border border-card-border rounded-lg px-4 py-3">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
