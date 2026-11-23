import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-sidebar-border">
        <Button
          onClick={onNew}
          className="w-full gap-2"
          variant="default"
          data-testid="button-new-conversation"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-sidebar-accent/30 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-colors hover-elevate",
                  activeId === conversation.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                )}
                onClick={() => onSelect(conversation.id)}
                data-testid={`conversation-item-${conversation.id}`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversation.id);
                  }}
                  data-testid={`button-delete-conversation-${conversation.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
