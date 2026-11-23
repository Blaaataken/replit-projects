import { useEffect, useRef } from "react";
import type { Message } from "@shared/schema";
import { MessageBubble } from "./message-bubble";
import { StreamingMessage } from "./streaming-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
}

export function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" data-testid="empty-chat-state">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-muted-foreground text-sm">
            Ask me anything! I can help you with text, voice, and video inputs.
            I learn from our conversations and can reference past discussions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full" data-testid="message-list">
      <div 
        ref={scrollRef}
        className="max-w-3xl mx-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isStreaming && (
          <StreamingMessage content={streamingContent || ""} isLoading={!streamingContent} />
        )}
      </div>
    </ScrollArea>
  );
}
