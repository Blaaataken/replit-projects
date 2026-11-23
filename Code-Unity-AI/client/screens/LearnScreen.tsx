import React from "react";
import { View, ScrollView, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

const categories = [
  { id: "data-structures", title: "Data Structures", icon: "layers", count: 12 },
  { id: "algorithms", title: "Algorithms", icon: "zap", count: 18 },
  { id: "design-patterns", title: "Design Patterns", icon: "grid", count: 8 },
  { id: "optimization", title: "Optimization", icon: "trending-up", count: 6 },
];

const tutorials = [
  { id: 1, title: "Binary Search Trees", category: "Data Structures", duration: "15 min", progress: 0.6 },
  { id: 2, title: "Dynamic Programming Basics", category: "Algorithms", duration: "25 min", progress: 0.3 },
  { id: 3, title: "Singleton Pattern", category: "Design Patterns", duration: "10 min", progress: 0 },
  { id: 4, title: "Graph Traversal", category: "Algorithms", duration: "20 min", progress: 0 },
  { id: 5, title: "Hash Tables Deep Dive", category: "Data Structures", duration: "18 min", progress: 0.8 },
];

function CategoryCard({ item, onPress }: { item: typeof categories[0]; onPress: () => void }) {
  const { theme } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCard,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: theme.accent + "20" }]}>
        <Feather name={item.icon as any} size={20} color={theme.accent} />
      </View>
      <ThemedText type="h4" style={styles.categoryTitle}>{item.title}</ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.count} lessons</ThemedText>
    </Pressable>
  );
}

function TutorialCard({ item, onPress }: { item: typeof tutorials[0]; onPress: () => void }) {
  const { theme } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tutorialCard,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.tutorialContent}>
        <ThemedText type="h4" numberOfLines={1} style={styles.tutorialTitle}>
          {item.title}
        </ThemedText>
        <View style={styles.tutorialMeta}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.category}
          </ThemedText>
          <View style={styles.dot} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.duration}
          </ThemedText>
        </View>
        {item.progress > 0 ? (
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.progressBar,
                  { 
                    backgroundColor: theme.accent,
                    width: `${item.progress * 100}%`,
                  },
                ]}
              />
            </View>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {Math.round(item.progress * 100)}%
            </ThemedText>
          </View>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const handleCategoryPress = async (categoryId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTutorialPress = async (tutorialId: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Image
          source={require("../../assets/images/learn-hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <ThemedText type="h3" style={styles.heroTitle}>Master Algorithms & Data Structures</ThemedText>
        <ThemedText type="body" style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Interactive tutorials designed to help you understand complex concepts through practical examples.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Categories</ThemedText>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              item={category}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Continue Learning</ThemedText>
        {tutorials.map((tutorial, index) => (
          <View key={tutorial.id} style={index < tutorials.length - 1 ? { marginBottom: Spacing.md } : undefined}>
            <TutorialCard
              item={tutorial}
              onPress={() => handleTutorialPress(tutorial.id)}
            />
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  heroImage: {
    width: "100%",
    height: 140,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  categoryCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "flex-start",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryTitle: {
    marginBottom: Spacing.xs,
  },
  tutorialCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  tutorialContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  tutorialTitle: {
    marginBottom: Spacing.xs,
  },
  tutorialMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#718096",
    marginHorizontal: Spacing.sm,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
