import { useEffect, useRef } from "react";
import { Sparkles, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, StreamingMessage, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { MessageResponse } from "@shared/schema";

interface ChatViewProps {
  messages: MessageResponse[];
  onSend: (content: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  streamingContent?: string;
  conversationId: number | null;
}

export function ChatView({
  messages,
  onSend,
  isLoading,
  isStreaming,
  streamingContent,
  conversationId,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  if (!conversationId) {
    return <WelcomeScreen onSend={onSend} />;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea
        className="flex-1"
        ref={scrollRef}
      >
        <div className="max-w-3xl mx-auto py-4">
          {messages.length === 0 && !isLoading && !isStreaming && (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Ask me anything! I can help you break down complex tasks, solve problems, 
                generate ideas, and explain difficult concepts.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isStreaming && streamingContent && (
            <StreamingMessage content={streamingContent} />
          )}

          {isLoading && !isStreaming && <TypingIndicator />}
        </div>
      </ScrollArea>

      <ChatInput onSend={onSend} disabled={isLoading || isStreaming} />
    </div>
  );
}

function WelcomeScreen({ onSend }: { onSend: (content: string) => void }) {
  const examplePrompts = [
    "Help me plan a software development project from scratch",
    "Explain quantum computing in simple terms",
    "Create a weekly workout routine for beginners",
    "Help me write a professional email to my manager",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Nexus AI</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Your intelligent task assistant. I can help you understand complex problems, 
            break down tasks, and provide step-by-step guidance for any challenge.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSend(prompt)}
                className="p-4 text-left bg-card border border-card-border rounded-lg hover-elevate transition-colors"
                data-testid={`button-example-prompt-${index}`}
              >
                <p className="text-sm line-clamp-2">{prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChatInput onSend={onSend} placeholder="Start a conversation with Nexus..." />
    </div>
  );
}
