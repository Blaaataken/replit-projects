import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conversation } from "@shared/schema";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
  onDelete?: (conversationId: string) => void;
  isLoading?: boolean;
}

function groupConversations(conversations: Conversation[]) {
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  conversations.forEach((conv) => {
    const date = conv.createdAt ? new Date(conv.createdAt) : new Date();
    if (isToday(date)) {
      today.push(conv);
    } else if (isYesterday(date)) {
      yesterday.push(conv);
    } else if (isThisWeek(date)) {
      thisWeek.push(conv);
    } else {
      older.push(conv);
    }
  });

  return { today, yesterday, thisWeek, older };
}

function ConversationGroup({
  title,
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
}: {
  title: string;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  if (conversations.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-muted-foreground px-3 mb-2">{title}</h3>
      <div className="space-y-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover-elevate",
              activeConversationId === conv.id && "bg-sidebar-accent"
            )}
            onClick={() => onSelect(conv.id)}
            data-testid={`conversation-item-${conv.id}`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm truncate">{conv.title}</span>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                data-testid={`button-delete-conversation-${conv.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
}: ConversationListProps) {
  const grouped = groupConversations(conversations);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <Button
          onClick={onNew}
          className="w-full justify-start gap-2"
          variant="outline"
          data-testid="button-new-conversation"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm p-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start a new conversation with Alice</p>
          </div>
        ) : (
          <>
            <ConversationGroup
              title="Today"
              conversations={grouped.today}
              activeConversationId={activeConversationId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
            <ConversationGroup
              title="Yesterday"
              conversations={grouped.yesterday}
              activeConversationId={activeConversationId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
            <ConversationGroup
              title="This Week"
              conversations={grouped.thisWeek}
              activeConversationId={activeConversationId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
            <ConversationGroup
              title="Older"
              conversations={grouped.older}
              activeConversationId={activeConversationId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          </>
        )}
      </ScrollArea>
    </div>
  );
}
