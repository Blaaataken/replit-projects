import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useMining, MiningSession } from "@/contexts/MiningContext";
import { MiningColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

type TimePeriod = "24h" | "7d" | "30d" | "all";

const screenWidth = Dimensions.get("window").width;

function TimePeriodSelector({
  selected,
  onSelect,
}: {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
}) {
  const periods: TimePeriod[] = ["24h", "7d", "30d", "all"];

  return (
    <View style={styles.periodContainer}>
      {periods.map((period) => (
        <Pressable
          key={period}
          style={[
            styles.periodButton,
            selected === period && styles.periodButtonActive,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(period);
          }}
        >
          <ThemedText
            type="small"
            color={selected === period ? undefined : "muted"}
            style={selected === period ? styles.periodTextActive : undefined}
          >
            {period === "all" ? "All Time" : period.toUpperCase()}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function SimpleHashrateChart({ sessions }: { sessions: MiningSession[] }) {
  const chartData = useMemo(() => {
    if (sessions.length === 0) return [];
    const maxPoints = 12;
    const step = Math.max(1, Math.floor(sessions.length / maxPoints));
    return sessions
      .filter((_, i) => i % step === 0)
      .slice(-maxPoints)
      .map((session) => ({
        value: session.totalShares * 50 + Math.random() * 200,
        label: new Date(session.startTime).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [sessions]);

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Feather name="bar-chart-2" size={48} color={MiningColors.inactive} />
        <ThemedText type="body" color="muted" style={styles.emptyChartText}>
          No mining data yet
        </ThemedText>
      </View>
    );
  }

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const chartHeight = 120;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {chartData.map((data, index) => {
          const barHeight = (data.value / maxValue) * chartHeight;
          return (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor:
                      index === chartData.length - 1
                        ? MiningColors.primary
                        : MiningColors.surfaceElevated,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EarningsCard({ sessions }: { sessions: MiningSession[] }) {
  const totalEarnings = sessions.reduce((sum, s) => sum + s.earnings, 0);
  const avgPerSession =
    sessions.length > 0 ? totalEarnings / sessions.length : 0;

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <Card elevation={1} style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <Feather name="dollar-sign" size={20} color={MiningColors.secondary} />
          <ThemedText type="h4">Earnings</ThemedText>
        </View>

        <View style={styles.earningsRow}>
          <View style={styles.earningsItem}>
            <ThemedText type="mono" style={styles.earningsValue}>
              ${totalEarnings.toFixed(6)}
            </ThemedText>
            <ThemedText type="caption" color="muted">
              Total Earned
            </ThemedText>
          </View>
          <View style={styles.earningsItem}>
            <ThemedText type="mono" style={styles.earningsValueSmall}>
              ${avgPerSession.toFixed(6)}
            </ThemedText>
            <ThemedText type="caption" color="muted">
              Avg/Session
            </ThemedText>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function SharesCard({ sessions }: { sessions: MiningSession[] }) {
  const totalShares = sessions.reduce((sum, s) => sum + s.totalShares, 0);
  const avgRatio = 0.95;

  return (
    <Animated.View entering={FadeInDown.delay(300).springify()}>
      <Card elevation={1} style={styles.sharesCard}>
        <View style={styles.sharesHeader}>
          <Feather name="pie-chart" size={20} color={MiningColors.primary} />
          <ThemedText type="h4">Shares Statistics</ThemedText>
        </View>

        <View style={styles.sharesContent}>
          <View style={styles.sharesCircle}>
            <ThemedText type="h2" color="primary">
              {Math.round(avgRatio * 100)}%
            </ThemedText>
            <ThemedText type="caption" color="muted">
              Accept Rate
            </ThemedText>
          </View>

          <View style={styles.sharesDetails}>
            <View style={styles.shareRow}>
              <View style={styles.shareIndicator}>
                <View
                  style={[
                    styles.shareIndicatorDot,
                    { backgroundColor: MiningColors.success },
                  ]}
                />
                <ThemedText type="small" color="muted">
                  Accepted
                </ThemedText>
              </View>
              <ThemedText type="body">
                {Math.round(totalShares * avgRatio)}
              </ThemedText>
            </View>
            <View style={styles.shareRow}>
              <View style={styles.shareIndicator}>
                <View
                  style={[
                    styles.shareIndicatorDot,
                    { backgroundColor: MiningColors.danger },
                  ]}
                />
                <ThemedText type="small" color="muted">
                  Rejected
                </ThemedText>
              </View>
              <ThemedText type="body">
                {Math.round(totalShares * (1 - avgRatio))}
              </ThemedText>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function SessionItem({ session }: { session: MiningSession }) {
  const duration = session.endTime
    ? Math.round((session.endTime - session.startTime) / 1000 / 60)
    : 0;

  return (
    <View style={styles.sessionItem}>
      <View style={styles.sessionInfo}>
        <View style={styles.sessionHeader}>
          <ThemedText type="body">
            {new Date(session.startTime).toLocaleDateString()}
          </ThemedText>
          <View style={styles.algorithmTag}>
            <ThemedText type="caption" color="primary">
              {session.algorithm}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" color="muted">
          {duration}min - {session.mode} mode - {session.totalShares} shares
        </ThemedText>
      </View>
      <View style={styles.sessionEarnings}>
        <ThemedText type="mono" color="secondary">
          ${session.earnings.toFixed(5)}
        </ThemedText>
      </View>
    </View>
  );
}

function SessionHistory({ sessions }: { sessions: MiningSession[] }) {
  const recentSessions = sessions.slice(0, 10);

  if (recentSessions.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.delay(400).springify()}>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Mining Sessions
      </ThemedText>
      <Card elevation={1}>
        {recentSessions.map((session, index) => (
          <View key={session.id}>
            <SessionItem session={session} />
            {index < recentSessions.length - 1 ? (
              <View style={styles.sessionDivider} />
            ) : null}
          </View>
        ))}
      </Card>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { sessions, stats, isMining } = useMining();
  const [period, setPeriod] = useState<TimePeriod>("7d");

  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const cutoffs: Record<TimePeriod, number> = {
      "24h": now - 24 * 60 * 60 * 1000,
      "7d": now - 7 * 24 * 60 * 60 * 1000,
      "30d": now - 30 * 24 * 60 * 60 * 1000,
      all: 0,
    };
    return sessions.filter((s) => s.startTime >= cutoffs[period]);
  }, [sessions, period]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <TimePeriodSelector selected={period} onSelect={setPeriod} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card elevation={1} style={styles.chartCard}>
            <ThemedText type="h4" style={styles.chartTitle}>
              Hashrate Performance
            </ThemedText>
            <SimpleHashrateChart sessions={filteredSessions} />
            {isMining ? (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <ThemedText type="caption" color="success">
                  Live: {stats.hashrate} H/s
                </ThemedText>
              </View>
            ) : null}
          </Card>
        </Animated.View>

        <EarningsCard sessions={filteredSessions} />
        <SharesCard sessions={filteredSessions} />
        <SessionHistory sessions={filteredSessions} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MiningColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  periodContainer: {
    flexDirection: "row",
    backgroundColor: MiningColors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  periodButtonActive: {
    backgroundColor: MiningColors.surfaceElevated,
  },
  periodTextActive: {
    fontWeight: "600",
  },
  chartCard: {
    padding: Spacing.lg,
  },
  chartTitle: {
    marginBottom: Spacing.md,
  },
  chartContainer: {
    height: 140,
    marginBottom: Spacing.md,
  },
  chartBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "80%",
    borderRadius: 4,
    minHeight: 4,
  },
  emptyChart: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    marginTop: Spacing.md,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MiningColors.success,
  },
  earningsCard: {
    padding: Spacing.lg,
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  earningsRow: {
    flexDirection: "row",
  },
  earningsItem: {
    flex: 1,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: "700",
    color: MiningColors.secondary,
    marginBottom: Spacing.xs,
  },
  earningsValueSmall: {
    fontSize: 18,
    fontWeight: "600",
    color: MiningColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sharesCard: {
    padding: Spacing.lg,
  },
  sharesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sharesContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sharesCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: MiningColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xl,
  },
  sharesDetails: {
    flex: 1,
    gap: Spacing.md,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shareIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  shareIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sessionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  sessionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  algorithmTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: MiningColors.surfaceElevated,
    borderRadius: 4,
  },
  sessionEarnings: {
    alignItems: "flex-end",
  },
  sessionDivider: {
    height: 1,
    backgroundColor: MiningColors.surfaceElevated,
  },
});
