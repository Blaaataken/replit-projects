import { Plus, MessageSquare, Trash2, Search, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { Conversation } from "@shared/schema";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  knowledgeCount?: number;
}

function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Last 7 Days", items: [] },
    { label: "Older", items: [] },
  ];

  conversations.forEach((conv) => {
    const convDate = new Date(conv.createdAt);
    if (convDate >= today) {
      groups[0].items.push(conv);
    } else if (convDate >= yesterday) {
      groups[1].items.push(conv);
    } else if (convDate >= lastWeek) {
      groups[2].items.push(conv);
    } else {
      groups[3].items.push(conv);
    }
  });

  return groups.filter((g) => g.items.length > 0);
}

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
  knowledgeCount = 0,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-3 space-y-3">
        <Button 
          onClick={onNew} 
          className="w-full justify-start gap-2"
          data-testid="button-new-chat"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            data-testid="input-search-conversations"
          />
        </div>

        {knowledgeCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {knowledgeCount} learned insights
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : groupedConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm" data-testid="empty-conversations">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            groupedConversations.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((conversation) => (
                      <SidebarMenuItem key={conversation.id}>
                        <SidebarMenuButton
                          isActive={selectedId === conversation.id}
                          onClick={() => onSelect(conversation.id)}
                          className="group justify-between gap-2"
                          data-testid={`button-conversation-${conversation.id}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{conversation.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(conversation.id);
                            }}
                            data-testid={`button-delete-conversation-${conversation.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
