import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Image, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight, SlideOutRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useMining, MiningDevice } from "@/contexts/MiningContext";
import { MiningColors, Spacing, BorderRadius } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getDeviceIcon(type: MiningDevice["type"]): any {
  switch (type) {
    case "phone":
      return "smartphone";
    case "tablet":
      return "tablet";
    case "laptop":
      return "monitor";
    case "desktop":
      return "cpu";
    case "iot":
      return "cpu";
    default:
      return "cpu";
  }
}

function getTierColor(tier: MiningDevice["performanceTier"]): string {
  switch (tier) {
    case "high":
      return MiningColors.success;
    case "medium":
      return MiningColors.warning;
    case "low":
      return MiningColors.textSecondary;
  }
}

function DeviceCard({
  device,
  onDisconnect,
}: {
  device: MiningDevice;
  onDisconnect: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActions(!showActions);
  };

  return (
    <Animated.View
      entering={FadeInRight.springify()}
      exiting={SlideOutRight}
    >
      <Card elevation={1} style={styles.deviceCard} onPress={handlePress}>
        <View style={styles.deviceHeader}>
          <View style={styles.deviceIconContainer}>
            <Feather
              name={getDeviceIcon(device.type)}
              size={24}
              color={MiningColors.primary}
            />
            {device.isLocal ? (
              <View style={styles.localBadge}>
                <ThemedText type="caption" style={styles.localBadgeText}>
                  You
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.deviceInfo}>
            <ThemedText type="body" style={styles.deviceName}>
              {device.name}
            </ThemedText>
            <View style={styles.deviceMeta}>
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: getTierColor(device.performanceTier) + "20" },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{ color: getTierColor(device.performanceTier) }}
                >
                  {device.performanceTier.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText type="caption" color="muted">
                {device.type}
              </ThemedText>
            </View>
          </View>

          <View style={styles.deviceStats}>
            <ThemedText type="mono" color="primary" style={styles.hashrateText}>
              {device.hashrate}
            </ThemedText>
            <ThemedText type="caption" color="muted">
              H/s
            </ThemedText>
          </View>

          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: device.isConnected
                  ? MiningColors.success
                  : MiningColors.inactive,
              },
            ]}
          />
        </View>

        {showActions && !device.isLocal ? (
          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.disconnectButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDisconnect();
              }}
            >
              <Feather name="x" size={16} color={MiningColors.danger} />
              <ThemedText type="small" color="danger">
                Disconnect
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      style={styles.emptyContainer}
    >
      <Image
        source={require("@assets/images/p2p-empty.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Devices Found
      </ThemedText>
      <ThemedText type="body" color="muted" style={styles.emptyDescription}>
        Scan your local network to discover other mining devices and form a group
      </ThemedText>
      <Button onPress={onScan} style={styles.scanButton}>
        Scan for Devices
      </Button>
    </Animated.View>
  );
}

export default function DevicesScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { devices, scanForDevices, disconnectDevice } = useMining();
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await scanForDevices();
    setRefreshing(false);
  }, [scanForDevices]);

  const handleScan = useCallback(async () => {
    setScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await scanForDevices();
    setScanning(false);
  }, [scanForDevices]);

  const renderDevice = useCallback(
    ({ item }: { item: MiningDevice }) => (
      <DeviceCard
        device={item}
        onDisconnect={() => disconnectDevice(item.id)}
      />
    ),
    [disconnectDevice]
  );

  const totalHashrate = devices
    .filter((d) => d.isConnected)
    .reduce((sum, d) => sum + d.hashrate, 0);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MiningColors.primary}
          />
        }
        ListHeaderComponent={
          devices.length > 0 ? (
            <Animated.View entering={FadeInDown.springify()}>
              <Button
                onPress={handleScan}
                disabled={scanning}
                style={styles.scanHeaderButton}
              >
                {scanning ? "Scanning..." : "Scan for Devices"}
              </Button>

              <Card elevation={1} style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <ThemedText type="h3" color="primary">
                      {devices.filter((d) => d.isConnected).length}
                    </ThemedText>
                    <ThemedText type="caption" color="muted">
                      Connected
                    </ThemedText>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <ThemedText type="h3" color="secondary">
                      {totalHashrate.toLocaleString()}
                    </ThemedText>
                    <ThemedText type="caption" color="muted">
                      Total H/s
                    </ThemedText>
                  </View>
                </View>
              </Card>

              <ThemedText type="h4" style={styles.sectionTitle}>
                Devices
              </ThemedText>
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={<EmptyState onScan={handleScan} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MiningColors.background,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  scanHeaderButton: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: MiningColors.surfaceElevated,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  deviceCard: {
    padding: Spacing.lg,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  deviceIconContainer: {
    position: "relative",
  },
  localBadge: {
    position: "absolute",
    top: -8,
    right: -12,
    backgroundColor: MiningColors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  localBadgeText: {
    fontSize: 8,
    color: MiningColors.background,
    fontWeight: "600",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    marginBottom: 2,
  },
  deviceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tierBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deviceStats: {
    alignItems: "flex-end",
  },
  hashrateText: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: MiningColors.surfaceElevated,
    alignItems: "flex-end",
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing["2xl"],
    opacity: 0.8,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  scanButton: {
    minWidth: 200,
  },
});
