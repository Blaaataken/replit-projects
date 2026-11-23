import { Link, useLocation } from "wouter";
import { MessageSquare, Target, Settings, Lightbulb, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AliceAvatar } from "./alice-avatar";
import { ConversationList } from "./conversation-list";
import type { Conversation, User as UserType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  user?: UserType;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
  isLoadingConversations?: boolean;
}

const navItems = [
  { title: "Chat", url: "/", icon: MessageSquare },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Insights", url: "/insights", icon: Lightbulb },
];

export function AppSidebar({
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoadingConversations,
}: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <AliceAvatar size="md" />
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg">Alice</h1>
            <p className="text-xs text-muted-foreground">Your Personal Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {location === "/" && (
          <>
            <SidebarSeparator />
            <SidebarGroup className="flex-1">
              <SidebarGroupLabel>Conversations</SidebarGroupLabel>
              <SidebarGroupContent className="flex-1">
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelect={onSelectConversation}
                  onNew={onNewConversation}
                  onDelete={onDeleteConversation}
                  isLoading={isLoadingConversations}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3" />
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName || user?.email?.split("@")[0] || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            data-testid="button-logout"
          >
            <a href="/api/logout">
              <LogOut className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
