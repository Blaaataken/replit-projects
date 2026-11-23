import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "@/components/chat-input";
import { MessageBubble } from "@/components/message-bubble";
import { TypingIndicator } from "@/components/typing-indicator";
import { AliceAvatar } from "@/components/alice-avatar";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@shared/schema";
import { Sparkles } from "lucide-react";

interface ChatPageProps {
  user?: User;
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export default function ChatPage({ user, conversationId, onConversationCreated }: ChatPageProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const { data: serverMessages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversationId && serverMessages.length > 0) {
      const hasRealLocalMessages = localMessages.some(m => !m.id.startsWith("temp-"));
      if (!hasRealLocalMessages || serverMessages.length > localMessages.filter(m => !m.id.startsWith("temp-")).length) {
        setLocalMessages(serverMessages);
      }
    }
  }, [serverMessages, conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setLocalMessages([]);
    }
  }, [conversationId]);

  const displayMessages = localMessages.length > 0 ? localMessages : serverMessages;

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsTyping(true);
      
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversationId: conversationId || "new",
        role: "user",
        content,
        createdAt: new Date(),
      };
      setLocalMessages(prev => [...prev, tempUserMessage]);
      
      const response = await apiRequest("POST", "/api/chat", {
        conversationId,
        content,
      });
      return response;
    },
    onSuccess: (data: any) => {
      setIsTyping(false);
      const newConversationId = data.conversationId;
      
      if (data.userMessage && data.assistantMessage) {
        setLocalMessages(prev => {
          const withoutTemp = prev.filter(m => !m.id.startsWith("temp-"));
          return [...withoutTemp, data.userMessage, data.assistantMessage];
        });
      }

      if (newConversationId && !conversationId) {
        onConversationCreated?.(newConversationId);
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/conversations", newConversationId, "messages"] });
        }, 100);
      } else if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      setIsTyping(false);
      setLocalMessages(prev => prev.filter(m => !m.id.startsWith("temp-")));
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages, isTyping]);

  const handleSend = useCallback((content: string) => {
    if (!sendMessageMutation.isPending) {
      sendMessageMutation.mutate(content);
    }
  }, [sendMessageMutation]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleVoiceToggle = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      recognitionRef.current = null;
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript?.trim()) {
        handleSend(transcript.trim());
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      recognitionRef.current = null;
      if (event.error !== "aborted" && event.error !== "no-speech") {
        toast({
          title: "Voice Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    
    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isListening, toast, handleSend]);

  if (displayMessages.length === 0 && !isTyping) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <AliceAvatar size="lg" className="mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Hello{user?.firstName ? `, ${user.firstName}` : ""}!</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              I'm Alice, your personal AI assistant. I'm here to help you achieve your goals, 
              answer your questions, and provide insights tailored just for you.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Help me set a new goal",
                "What can you do?",
                "Give me some productivity tips",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(suggestion)}
                  className="text-sm"
                  data-testid={`button-suggestion-${suggestion.slice(0, 10)}`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <ChatInput
          onSend={handleSend}
          isLoading={sendMessageMutation.isPending}
          onVoiceToggle={handleVoiceToggle}
          isListening={isListening}
          placeholder="Start a conversation with Alice..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messagesLoading && conversationId ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            displayMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                user={user}
                showTimestamp={
                  index === 0 ||
                  (displayMessages[index - 1] &&
                    message.createdAt &&
                    displayMessages[index - 1].createdAt &&
                    new Date(message.createdAt).getTime() -
                      new Date(displayMessages[index - 1].createdAt!).getTime() >
                      300000)
                }
              />
            ))
          )}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>
      <ChatInput
        onSend={handleSend}
        isLoading={sendMessageMutation.isPending}
        onVoiceToggle={handleVoiceToggle}
        isListening={isListening}
      />
    </div>
  );
}
