import { cn } from "@/lib/utils";
import { AliceAvatar } from "./alice-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message, User } from "@shared/schema";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  user?: User;
  showTimestamp?: boolean;
}

export function MessageBubble({ message, user, showTimestamp = false }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
      data-testid={`message-bubble-${message.id}`}
    >
      {isAssistant ? (
        <AliceAvatar size="sm" />
      ) : (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
          <AvatarFallback className="text-xs">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm leading-relaxed",
            isAssistant
              ? "bg-muted text-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {showTimestamp && message.createdAt && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}
