import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import ChatPage from "./chat";
import GoalsPage from "./goals";
import InsightsPage from "./insights";
import NotFound from "./not-found";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/conversations", { title: "New Conversation" });
    },
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(data.id);
      if (location !== "/") {
        setLocation("/");
      }
    },
    onError: () => {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(conversations.find(c => c.id !== deletedId)?.id);
      }
      toast({ title: "Conversation deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete conversation", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && location === "/") {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, location]);

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    if (location !== "/") {
      setLocation("/");
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if (location !== "/") {
      setLocation("/");
    }
  };

  const handleConversationCreated = (id: string) => {
    setActiveConversationId(id);
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
  };

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          user={user}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
          isLoadingConversations={conversationsLoading}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">
            <Switch>
              <Route path="/">
                <ChatPage
                  user={user}
                  conversationId={activeConversationId}
                  onConversationCreated={handleConversationCreated}
                />
              </Route>
              <Route path="/goals" component={GoalsPage} />
              <Route path="/insights" component={InsightsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
