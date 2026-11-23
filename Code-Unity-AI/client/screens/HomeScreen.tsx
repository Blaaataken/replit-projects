import React from "react";
import { View, FlatList, StyleSheet, Pressable, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Conversation = {
  id: number;
  title: string;
  createdAt: string;
};

const quickActions = [
  { id: "algorithm", icon: "code", title: "Algorithm Design", color: "#4FD1C5" },
  { id: "review", icon: "eye", title: "Code Review", color: "#ED8936" },
  { id: "debug", icon: "tool", title: "Debug Help", color: "#F56565" },
];

function QuickActionCard({ item, onPress }: { item: typeof quickActions[0]; onPress: () => void }) {
  const { theme } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + "20" }]}>
        <Feather name={item.icon as any} size={20} color={item.color} />
      </View>
      <ThemedText type="small" style={styles.quickActionTitle}>{item.title}</ThemedText>
    </Pressable>
  );
}

function SessionCard({ item, onPress }: { item: Conversation; onPress: () => void }) {
  const { theme } = useTheme();
  const timeAgo = getTimeAgo(new Date(item.createdAt));
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sessionCard,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.sessionContent}>
        <ThemedText type="h4" numberOfLines={1} style={styles.sessionTitle}>
          {item.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {timeAgo}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

function EmptyState() {
  const { theme } = useTheme();
  
  return (
    <View style={styles.emptyState}>
      <Image
        source={require("../../assets/images/empty-sessions.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h3" style={styles.emptyTitle}>Start Your First Session</ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Begin a conversation with Unity AI to design efficient algorithms and improve your code.
      </ThemedText>
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: conversations, isLoading, error } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const handleQuickAction = async (actionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Chat", { quickAction: actionId });
  };

  const handleOpenSession = async (conversationId: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Chat", { conversationId });
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="display" style={styles.greeting}>
          Welcome back
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Ready to design something great?
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              item={action}
              onPress={() => handleQuickAction(action.id)}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Recent Sessions</ThemedText>
      </Animated.View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={conversations || []}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={<EmptyState />}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(400 + index * 50).duration(400)}>
          <SessionCard item={item} onPress={() => handleOpenSession(item.id)} />
        </Animated.View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  quickAction: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    textAlign: "center",
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  sessionContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  sessionTitle: {
    marginBottom: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptySubtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
});
