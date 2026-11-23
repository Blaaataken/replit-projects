import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeInUp, SlideInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest, getApiUrl } from "@/lib/query-client";

type Message = {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type ConversationWithMessages = {
  id: number;
  title: string;
  createdAt: string;
  messages: Message[];
};

const quickActionPrompts: Record<string, string> = {
  algorithm: "I need help designing an efficient algorithm. Let's start with the problem I'm trying to solve.",
  review: "I'd like you to review my code for best practices, efficiency, and potential improvements.",
  debug: "I'm encountering a bug in my code and need help debugging it. Let me describe the issue.",
};

function MessageBubble({ message, onCopy }: { message: Message; onCopy: () => void }) {
  const { theme, isDark } = useTheme();
  const isUser = message.role === "user";

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        {
          backgroundColor: isUser
            ? theme.accent
            : isDark
            ? theme.backgroundSecondary
            : theme.backgroundDefault,
        },
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.messageText,
          { color: isUser ? "#FFFFFF" : theme.text },
        ]}
      >
        {message.content}
      </ThemedText>
      {!isUser ? (
        <Pressable
          onPress={onCopy}
          style={({ pressed }) => [
            styles.copyButton,
            { opacity: pressed ? 0.6 : 0.4 },
          ]}
          hitSlop={10}
        >
          <Feather name="copy" size={14} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function TypingIndicator() {
  const { theme, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.messageBubble,
        styles.assistantBubble,
        {
          backgroundColor: isDark
            ? theme.backgroundSecondary
            : theme.backgroundDefault,
        },
      ]}
    >
      <View style={styles.typingDots}>
        <Animated.View
          entering={FadeIn.duration(400).delay(0)}
          style={[styles.dot, { backgroundColor: theme.textSecondary }]}
        />
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={[styles.dot, { backgroundColor: theme.textSecondary }]}
        />
        <Animated.View
          entering={FadeIn.duration(400).delay(400)}
          style={[styles.dot, { backgroundColor: theme.textSecondary }]}
        />
      </View>
    </Animated.View>
  );
}

function EmptyState() {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <Feather name="message-circle" size={48} color={theme.accent} style={{ opacity: 0.5 }} />
      <ThemedText type="h4" style={[styles.emptyTitle, { marginTop: Spacing.lg }]}>
        Start a Conversation
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Ask Unity AI to help with algorithms, code review, or debugging.
      </ThemedText>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Chat">>();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(
    route.params?.conversationId || null
  );
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const { data: conversation, isLoading } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", conversationId],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages);
    }
  }, [conversation?.messages]);

  useEffect(() => {
    if (route.params?.quickAction && !conversationId) {
      const prompt = quickActionPrompts[route.params.quickAction];
      if (prompt) {
        setInputText(prompt);
      }
    }
  }, [route.params?.quickAction, conversationId]);

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isStreaming) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    const userMessage = inputText.trim();
    setInputText("");

    let currentConversationId = conversationId;

    if (!currentConversationId) {
      const newConversation = await createConversationMutation.mutateAsync(
        userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "")
      );
      currentConversationId = newConversation.id;
    }

    const tempUserMessage: Message = {
      id: Date.now(),
      conversationId: currentConversationId!,
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempUserMessage]);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const baseUrl = getApiUrl();
      const url = new URL(`/api/conversations/${currentConversationId}/messages`, baseUrl);
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              fullResponse += event.content;
              setStreamingContent(fullResponse);
            }
            if (event.done) {
              const assistantMessage: Message = {
                id: Date.now() + 1,
                conversationId: currentConversationId!,
                role: "assistant",
                content: fullResponse,
                createdAt: new Date().toISOString(),
              };
              setLocalMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent("");
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", currentConversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  }, [inputText, conversationId, isStreaming, createConversationMutation, queryClient]);

  const handleCopyMessage = async (content: string) => {
    await Clipboard.setStringAsync(content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const displayMessages = [...localMessages];
  if (streamingContent) {
    displayMessages.push({
      id: Date.now() + 2,
      conversationId: conversationId || 0,
      role: "assistant",
      content: streamingContent,
      createdAt: new Date().toISOString(),
    });
  }

  if (isLoading && conversationId) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        inverted={displayMessages.length > 0}
        data={displayMessages.toReversed()}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingTop: headerHeight + Spacing.lg },
        ]}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          isStreaming && !streamingContent ? <TypingIndicator /> : null
        }
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            onCopy={() => handleCopyMessage(item.content)}
          />
        )}
        onContentSizeChange={() => {
          if (displayMessages.length > 0) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }}
      />

      <Animated.View
        entering={SlideInRight.duration(300)}
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: isDark ? theme.backgroundSecondary : theme.backgroundDefault },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask Unity AI anything..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
            editable={!isStreaming}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!inputText.trim() || isStreaming}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !isStreaming ? theme.accent : theme.backgroundSecondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() && !isStreaming ? "#FFFFFF" : theme.textSecondary}
            />
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    lineHeight: 22,
  },
  copyButton: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
  },
  typingDots: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["4xl"],
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
    maxWidth: 280,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
});
