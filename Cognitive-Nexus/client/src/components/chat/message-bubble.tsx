import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { Message } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${message.id}`}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          "max-w-[75%] flex flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {message.mediaType && message.mediaData && (
          <div className="mb-2">
            {message.mediaType.startsWith("image") && (
              <img
                src={message.mediaData}
                alt="Attached media"
                className="max-w-full max-h-64 rounded-lg border border-border"
                data-testid={`img-attachment-${message.id}`}
              />
            )}
            {message.mediaType.startsWith("video") && (
              <video
                src={message.mediaData}
                controls
                className="max-w-full max-h-64 rounded-lg border border-border"
                data-testid={`video-attachment-${message.id}`}
              />
            )}
            {message.mediaType.startsWith("audio") && (
              <audio
                src={message.mediaData}
                controls
                className="w-full"
                data-testid={`audio-attachment-${message.id}`}
              />
            )}
          </div>
        )}
        <Card
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-card text-card-foreground rounded-bl-md"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </Card>
        <span className="text-xs text-muted-foreground px-2">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
