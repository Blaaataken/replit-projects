import { AliceAvatar } from "./alice-avatar";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3" data-testid="typing-indicator">
      <AliceAvatar size="sm" />
      <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
