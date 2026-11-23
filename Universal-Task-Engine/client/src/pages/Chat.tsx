import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatView } from "@/components/ChatView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import type { ConversationResponse, MessageResponse } from "@shared/schema";

function useChat() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const { toast } = useToast();

  // Fetch all conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationResponse[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch messages for active conversation
  const { data: conversationData, isLoading: messagesLoading } = useQuery<ConversationResponse & {
    messages: MessageResponse[];
  }>({
    queryKey: ["/api/conversations", activeConversationId],
    enabled: !!activeConversationId,
  });

  const messages = conversationData?.messages || [];

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(data.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  // Send message with streaming response
  const sendMessage = useCallback(
    async (content: string) => {
      let conversationId = activeConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        try {
          const response = await apiRequest("POST", "/api/conversations", {
            title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          });
          const newConversation = await response.json();
          conversationId = newConversation.id;
          setActiveConversationId(conversationId);
          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create conversation",
            variant: "destructive",
          });
          return;
        }
      }

      setIsStreaming(true);
      setStreamingContent("");

      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
              }

              if (data.done) {
                // Streaming complete
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                throw e;
              }
            }
          }
        }

        // Refresh messages after streaming completes
        queryClient.invalidateQueries({
          queryKey: ["/api/conversations", conversationId],
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [activeConversationId, toast]
  );

  const handleNewConversation = () => {
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: number) => {
    deleteConversation.mutate(id);
  };

  return {
    activeConversationId,
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    handleNewConversation,
    handleSelectConversation,
    handleDeleteConversation,
  };
}

export function ChatPage() {
  const {
    activeConversationId,
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    handleNewConversation,
    handleSelectConversation,
    handleDeleteConversation,
  } = useChat();

  return (
    <>
      <AppSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isLoading={conversationsLoading}
      />

      <SidebarInset className="flex flex-col">
        <header className="flex items-center justify-between gap-4 px-4 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatView
            messages={messages}
            onSend={sendMessage}
            isLoading={messagesLoading}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            conversationId={activeConversationId}
          />
        </main>
      </SidebarInset>
    </>
  );
}
