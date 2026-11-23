import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, Brain } from "lucide-react";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: selectedConversation, isLoading: isLoadingMessages } = useQuery<Conversation & { messages: Message[] }>({
    queryKey: ["/api/conversations", selectedConversationId],
    enabled: !!selectedConversationId,
  });

  const { data: knowledgeData } = useQuery<{ count: number }>({
    queryKey: ["/api/knowledge/count"],
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversationId(newConversation.id);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (selectedConversationId === deleteConversationMutation.variables) {
        setSelectedConversationId(null);
      }
    },
  });

  const handleNewChat = useCallback(async () => {
    const result = await createConversationMutation.mutateAsync("New Chat");
  }, [createConversationMutation]);

  const handleSelectConversation = useCallback((id: number) => {
    setSelectedConversationId(id);
  }, []);

  const handleDeleteConversation = useCallback((id: number) => {
    deleteConversationMutation.mutate(id);
  }, [deleteConversationMutation]);

  const handleSendMessage = useCallback(async (content: string, media?: { type: string; data: string }) => {
    if (!selectedConversationId) {
      const newConversation = await createConversationMutation.mutateAsync(content.slice(0, 50) || "New Chat");
      sendMessageToConversation(newConversation.id, content, media);
    } else {
      sendMessageToConversation(selectedConversationId, content, media);
    }
  }, [selectedConversationId, createConversationMutation]);

  const sendMessageToConversation = async (
    conversationId: number,
    content: string,
    media?: { type: string; data: string }
  ) => {
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, media }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                }
                if (data.done) {
                  break;
                }
              } catch {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge/count"] });
    }
  };

  const messages = selectedConversation?.messages || [];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={handleDeleteConversation}
          isLoading={isLoadingConversations}
          knowledgeCount={knowledgeData?.count || 0}
        />
        
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {selectedConversation && (
                <h1 className="font-semibold truncate" data-testid="text-conversation-title">
                  {selectedConversation.title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(knowledgeData?.count || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Brain className="h-3 w-3" />
                  <span data-testid="text-knowledge-count">{knowledgeData?.count}</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 flex flex-col overflow-hidden">
            {isLoadingMessages && selectedConversationId ? (
              <div className="flex-1 flex items-center justify-center" data-testid="loading-messages">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MessageList
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
              />
            )}
            
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isStreaming || createConversationMutation.isPending}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
