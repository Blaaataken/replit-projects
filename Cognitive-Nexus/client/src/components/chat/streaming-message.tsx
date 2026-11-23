import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreamingMessageProps {
  content: string;
  isLoading?: boolean;
}

export function StreamingMessage({ content, isLoading }: StreamingMessageProps) {
  return (
    <div className="flex gap-3 w-full flex-row" data-testid="streaming-message">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
        <Bot className="w-4 h-4" />
      </div>
      <div className="max-w-[75%] flex flex-col gap-1 items-start">
        <Card className="px-4 py-3 rounded-2xl bg-card text-card-foreground rounded-bl-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content || (isLoading ? "" : "...")}
            {isLoading && (
              <span className="inline-flex ml-1">
                <span className="animate-pulse">|</span>
              </span>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
