import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useMining, Algorithm, MiningMode } from "@/contexts/MiningContext";
import { MiningColors, Spacing, BorderRadius } from "@/constants/theme";

export default function MiningModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    isMining,
    algorithm,
    mode,
    startMining,
    stopMining,
    batteryLevel,
    performanceMode,
  } = useMining();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(algorithm);
  const [selectedMode, setSelectedMode] = useState<MiningMode>(mode);

  const algorithms: Algorithm[] = ["SHA-256", "Scrypt", "Ethash"];
  const modes: { value: MiningMode; label: string; icon: string }[] = [
    { value: "solo", label: "Solo Mining", icon: "user" },
    { value: "group", label: "Group Mining", icon: "users" },
  ];

  const handleStartMining = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startMining(selectedAlgorithm, selectedMode);
    navigation.goBack();
  };

  const handleStopMining = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    stopMining();
    navigation.goBack();
  };

  const estimatedDrain = () => {
    const rates: Record<typeof performanceMode, string> = {
      low: "~3%/hr",
      balanced: "~8%/hr",
      maximum: "~15%/hr",
    };
    return rates[performanceMode];
  };

  if (isMining) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.stopContainer}
          >
            <View style={styles.stopIconContainer}>
              <Feather name="activity" size={48} color={MiningColors.primary} />
            </View>
            <ThemedText type="h3" style={styles.stopTitle}>
              Mining in Progress
            </ThemedText>
            <ThemedText type="body" color="muted" style={styles.stopDescription}>
              Currently mining {algorithm} in {mode} mode
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <Button
              onPress={handleStopMining}
              style={[styles.stopButton, { backgroundColor: MiningColors.danger }]}
            >
              Stop Mining
            </Button>

            <Pressable
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <ThemedText type="body" color="muted">
                Cancel
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Mining Mode
          </ThemedText>
          <View style={styles.modeContainer}>
            {modes.map((m) => (
              <Pressable
                key={m.value}
                style={[
                  styles.modeOption,
                  selectedMode === m.value && styles.modeOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedMode(m.value);
                }}
              >
                <Feather
                  name={m.icon as any}
                  size={24}
                  color={
                    selectedMode === m.value
                      ? MiningColors.primary
                      : MiningColors.textSecondary
                  }
                />
                <ThemedText
                  type="body"
                  color={selectedMode === m.value ? "primary" : undefined}
                >
                  {m.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Algorithm
          </ThemedText>
          <Card elevation={1} style={styles.algorithmCard}>
            {algorithms.map((algo, index) => (
              <Pressable
                key={algo}
                style={[
                  styles.algorithmOption,
                  index < algorithms.length - 1 && styles.algorithmBorder,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedAlgorithm(algo);
                }}
              >
                <ThemedText type="body">{algo}</ThemedText>
                {selectedAlgorithm === algo ? (
                  <View style={styles.selectedIndicator}>
                    <Feather name="check" size={18} color={MiningColors.primary} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card elevation={1} style={styles.impactCard}>
            <View style={styles.impactRow}>
              <View style={styles.impactItem}>
                <Feather name="battery" size={20} color={MiningColors.warning} />
                <View>
                  <ThemedText type="small" color="muted">
                    Est. Battery Drain
                  </ThemedText>
                  <ThemedText type="body">{estimatedDrain()}</ThemedText>
                </View>
              </View>
              <View style={styles.impactItem}>
                <Feather name="battery-charging" size={20} color={MiningColors.success} />
                <View>
                  <ThemedText type="small" color="muted">
                    Current Battery
                  </ThemedText>
                  <ThemedText type="body">
                    {Math.round(batteryLevel * 100)}%
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.actions}
        >
          <Button onPress={handleStartMining}>Start Mining</Button>

          <Pressable
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <ThemedText type="body" color="muted">
              Cancel
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MiningColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  modeContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  modeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    backgroundColor: MiningColors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  modeOptionSelected: {
    borderColor: MiningColors.primary,
    backgroundColor: MiningColors.primary + "15",
  },
  algorithmCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  algorithmOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  algorithmBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MiningColors.surfaceElevated,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MiningColors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  impactCard: {
    marginBottom: Spacing.xl,
  },
  impactRow: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  impactItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  actions: {
    marginTop: "auto",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  stopContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stopIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MiningColors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  stopTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  stopDescription: {
    textAlign: "center",
  },
  stopButton: {
    marginBottom: Spacing.md,
  },
});
