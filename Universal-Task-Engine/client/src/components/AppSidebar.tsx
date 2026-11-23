import { MessageSquare, Plus, Trash2, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { ConversationResponse } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AppSidebarProps {
  conversations: ConversationResponse[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function AppSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isLoading,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Nexus AI</span>
        </div>
        <Button
          onClick={onNew}
          className="w-full gap-2"
          variant="default"
          data-testid="button-new-conversation"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <SidebarMenuItem key={i}>
                      <div className="h-12 bg-sidebar-accent/30 rounded-md animate-pulse mx-2" />
                    </SidebarMenuItem>
                  ))}
                </>
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
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      onClick={() => onSelect(conversation.id)}
                      isActive={activeId === conversation.id}
                      className="w-full justify-start pr-8"
                      data-testid={`conversation-item-${conversation.id}`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conversation.id);
                      }}
                      data-testid={`button-delete-conversation-${conversation.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
