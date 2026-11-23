import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useMining } from "@/contexts/MiningContext";
import { MiningColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

function StatusCard() {
  const { isMining, algorithm, stats, performanceMode } = useMining();

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <Card elevation={1} style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isMining ? MiningColors.success : MiningColors.inactive },
              ]}
            />
            <ThemedText type="body">
              {isMining ? "Mining Active" : "Mining Stopped"}
            </ThemedText>
          </View>
          <View style={styles.algorithmBadge}>
            <ThemedText type="caption" color="primary">
              {algorithm}
            </ThemedText>
          </View>
        </View>

        <View style={styles.hashrateContainer}>
          <ThemedText type="mono" style={styles.hashrateValue}>
            {stats.hashrate.toLocaleString()}
          </ThemedText>
          <ThemedText type="caption" color="muted">
            H/s
          </ThemedText>
        </View>

        <View style={styles.tempRow}>
          <Feather
            name="thermometer"
            size={16}
            color={stats.temperature > 55 ? MiningColors.warning : MiningColors.textSecondary}
          />
          <ThemedText
            type="small"
            color={stats.temperature > 55 ? "warning" : "muted"}
            style={styles.tempText}
          >
            {stats.temperature}C
          </ThemedText>
          <ThemedText type="caption" color="muted" style={styles.modeText}>
            {performanceMode.charAt(0).toUpperCase() + performanceMode.slice(1)} Mode
          </ThemedText>
        </View>
      </Card>
    </Animated.View>
  );
}

function QuickStatsGrid() {
  const { stats } = useMining();

  const statsData = [
    {
      label: "Accepted",
      value: stats.sharesAccepted.toString(),
      icon: "check-circle" as const,
      color: MiningColors.success,
    },
    {
      label: "Rejected",
      value: stats.sharesRejected.toString(),
      icon: "x-circle" as const,
      color: MiningColors.danger,
    },
    {
      label: "Uptime",
      value: formatUptime(stats.uptime),
      icon: "clock" as const,
      color: MiningColors.primary,
    },
    {
      label: "Earnings",
      value: `$${stats.estimatedEarnings.toFixed(4)}`,
      icon: "dollar-sign" as const,
      color: MiningColors.secondary,
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <Card key={stat.label} elevation={1} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Feather name={stat.icon} size={16} color={stat.color} />
            </View>
            <ThemedText type="h4" style={styles.statValue}>
              {stat.value}
            </ThemedText>
            <ThemedText type="caption" color="muted">
              {stat.label}
            </ThemedText>
          </Card>
        ))}
      </View>
    </Animated.View>
  );
}

function DevicesPreview() {
  const { devices } = useMining();
  const connectedDevices = devices.filter((d) => d.isConnected).slice(0, 3);

  if (connectedDevices.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.delay(300).springify()}>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Connected Devices
      </ThemedText>
      <Card elevation={1}>
        {connectedDevices.map((device, index) => (
          <View
            key={device.id}
            style={[
              styles.deviceRow,
              index < connectedDevices.length - 1 && styles.deviceRowBorder,
            ]}
          >
            <View style={styles.deviceInfo}>
              <Feather
                name={getDeviceIcon(device.type)}
                size={20}
                color={MiningColors.primary}
              />
              <View style={styles.deviceTextContainer}>
                <ThemedText type="body">{device.name}</ThemedText>
                <ThemedText type="caption" color="muted">
                  {device.hashrate} H/s
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.deviceStatus,
                { backgroundColor: device.isConnected ? MiningColors.success : MiningColors.inactive },
              ]}
            />
          </View>
        ))}
      </Card>
    </Animated.View>
  );
}

function BatteryWarning() {
  const { batteryLevel, isCharging, thermalWarning } = useMining();

  if (batteryLevel > 0.2 && !thermalWarning) {
    return null;
  }

  const showLowBattery = batteryLevel <= 0.2 && !isCharging;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View
        style={[
          styles.warningBanner,
          { backgroundColor: thermalWarning ? MiningColors.danger : MiningColors.warning },
        ]}
      >
        <Feather
          name={thermalWarning ? "thermometer" : "battery"}
          size={20}
          color={MiningColors.background}
        />
        <ThemedText type="small" style={styles.warningText}>
          {thermalWarning
            ? "High temperature detected. Consider reducing performance mode."
            : "Low battery. Connect charger for optimal mining."}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function getDeviceIcon(type: string): any {
  switch (type) {
    case "phone":
      return "smartphone";
    case "tablet":
      return "tablet";
    case "laptop":
      return "monitor";
    case "desktop":
      return "cpu";
    default:
      return "cpu";
  }
}

export default function HomeScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { scanForDevices } = useMining();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await scanForDevices();
    setRefreshing(false);
  }, [scanForDevices]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MiningColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <BatteryWarning />
        <StatusCard />
        <QuickStatsGrid />
        <DevicesPreview />
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
  statusCard: {
    padding: Spacing.xl,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  algorithmBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: MiningColors.surfaceElevated,
    borderRadius: BorderRadius.xs,
  },
  hashrateContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hashrateValue: {
    fontSize: 48,
    fontWeight: "700",
    color: MiningColors.primary,
    fontFamily: Fonts?.mono,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tempText: {
    marginRight: Spacing.lg,
  },
  modeText: {
    marginLeft: "auto",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
  },
  statHeader: {
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  deviceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MiningColors.surfaceElevated,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  deviceTextContainer: {
    gap: 2,
  },
  deviceStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  warningText: {
    flex: 1,
    color: MiningColors.background,
  },
});
