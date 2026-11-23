import React, { useState } from "react";
import { View, FlatList, StyleSheet, Pressable, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

type Algorithm = {
  id: number;
  title: string;
  language: string;
  complexity: string;
  code: string;
  explanation: string;
  isFavorite: number;
  createdAt: string;
};

const segments = ["All", "Favorites"];

const complexityColors: Record<string, string> = {
  "O(1)": "#48BB78",
  "O(log n)": "#48BB78",
  "O(n)": "#4FD1C5",
  "O(n log n)": "#ED8936",
  "O(n²)": "#F56565",
  "O(2^n)": "#F56565",
};

function AlgorithmCard({ item, onToggleFavorite }: { item: Algorithm; onToggleFavorite: () => void }) {
  const { theme } = useTheme();
  const complexityColor = complexityColors[item.complexity] || theme.textSecondary;
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.algorithmCard,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <ThemedText type="h4" numberOfLines={1} style={styles.algorithmTitle}>
            {item.title}
          </ThemedText>
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather
              name={item.isFavorite ? "star" : "star"}
              size={20}
              color={item.isFavorite ? "#ED8936" : theme.textSecondary}
              style={{ opacity: item.isFavorite ? 1 : 0.5 }}
            />
          </Pressable>
        </View>
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: theme.accent + "20" }]}>
            <ThemedText type="small" style={{ color: theme.accent }}>{item.language}</ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: complexityColor + "20" }]}>
            <ThemedText type="small" style={{ color: complexityColor }}>{item.complexity}</ThemedText>
          </View>
        </View>
      </View>
      <View style={[styles.codePreview, { backgroundColor: theme.codeBackground }]}>
        <ThemedText type="small" style={styles.codeText} numberOfLines={3}>
          {item.code}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function EmptyState({ type }: { type: "all" | "favorites" }) {
  const { theme } = useTheme();
  const isFavorites = type === "favorites";
  
  return (
    <View style={styles.emptyState}>
      <Image
        source={
          isFavorites
            ? require("../../assets/images/empty-library.png")
            : require("../../assets/images/empty-library.png")
        }
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h3" style={styles.emptyTitle}>
        {isFavorites ? "No Favorites Yet" : "No Algorithms Saved"}
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {isFavorites
          ? "Star algorithms to add them to your favorites for quick access."
          : "Algorithms you save from AI sessions will appear here."
        }
      </ThemedText>
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: algorithms, isLoading } = useQuery<Algorithm[]>({
    queryKey: ["/api/algorithms"],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
      await apiRequest("PATCH", `/api/algorithms/${id}/favorite`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/algorithms"] });
    },
  });

  const handleToggleFavorite = async (algorithm: Algorithm) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoriteMutation.mutate({
      id: algorithm.id,
      isFavorite: !algorithm.isFavorite,
    });
  };

  const filteredAlgorithms = algorithms?.filter((algo) => {
    if (selectedIndex === 1) return algo.isFavorite;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.segmentContainer, { paddingTop: headerHeight + Spacing.lg }]}>
        <SegmentedControl
          values={segments}
          selectedIndex={selectedIndex}
          onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
          style={styles.segmentedControl}
        />
      </View>
      
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredAlgorithms}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        ListEmptyComponent={<EmptyState type={selectedIndex === 1 ? "favorites" : "all"} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <AlgorithmCard
              item={item}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </View>
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
  segmentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  segmentedControl: {
    height: 36,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  algorithmCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  algorithmTitle: {
    flex: 1,
    marginRight: Spacing.md,
  },
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  codePreview: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    fontFamily: "monospace",
    color: "#A0AEC0",
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
