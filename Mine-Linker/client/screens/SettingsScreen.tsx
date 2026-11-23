import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useMining, PerformanceMode, Algorithm } from "@/contexts/MiningContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { MiningColors, Spacing, BorderRadius } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const avatarImages = {
  circuit: require("@assets/images/avatars/circuit.png"),
  hexagon: require("@assets/images/avatars/hexagon.png"),
  binary: require("@assets/images/avatars/binary.png"),
};

function ProfileSection() {
  const { profile, updateProfile } = useMining();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!profile) return null;

  const handleAvatarSelect = (type: "circuit" | "hexagon" | "binary") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateProfile({ avatarType: type });
    setShowAvatarPicker(false);
  };

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <Card elevation={1} style={styles.profileCard}>
        <Pressable
          style={styles.profileContent}
          onPress={() => setShowAvatarPicker(!showAvatarPicker)}
        >
          <Image
            source={avatarImages[profile.avatarType]}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText type="h4">{profile.displayName}</ThemedText>
            <ThemedText type="caption" color="muted">
              Tap to change avatar
            </ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={MiningColors.textSecondary}
          />
        </Pressable>

        {showAvatarPicker ? (
          <View style={styles.avatarPicker}>
            {(["circuit", "hexagon", "binary"] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.avatarOption,
                  profile.avatarType === type && styles.avatarOptionSelected,
                ]}
                onPress={() => handleAvatarSelect(type)}
              >
                <Image source={avatarImages[type]} style={styles.avatarSmall} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  danger,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && styles.settingsItemPressed,
      ]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={!onPress}
    >
      <View
        style={[
          styles.iconContainer,
          danger && { backgroundColor: MiningColors.danger + "20" },
        ]}
      >
        <Feather
          name={icon as any}
          size={18}
          color={danger ? MiningColors.danger : MiningColors.primary}
        />
      </View>
      <View style={styles.settingsItemContent}>
        <ThemedText type="body" color={danger ? "danger" : undefined}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" color="muted">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement ? (
        rightElement
      ) : onPress ? (
        <Feather
          name="chevron-right"
          size={20}
          color={MiningColors.textSecondary}
        />
      ) : null}
    </Pressable>
  );
}

function PerformanceModeSelector() {
  const { performanceMode, setPerformanceMode } = useMining();
  const modes: { value: PerformanceMode; label: string; icon: string }[] = [
    { value: "low", label: "Low Power", icon: "battery" },
    { value: "balanced", label: "Balanced", icon: "sliders" },
    { value: "maximum", label: "Maximum", icon: "zap" },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Performance Mode
      </ThemedText>
      <Card elevation={1} style={styles.modesCard}>
        {modes.map((mode, index) => (
          <Pressable
            key={mode.value}
            style={[
              styles.modeOption,
              performanceMode === mode.value && styles.modeOptionSelected,
              index < modes.length - 1 && styles.modeOptionBorder,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPerformanceMode(mode.value);
            }}
          >
            <Feather
              name={mode.icon as any}
              size={20}
              color={
                performanceMode === mode.value
                  ? MiningColors.primary
                  : MiningColors.textSecondary
              }
            />
            <ThemedText
              type="body"
              color={performanceMode === mode.value ? "primary" : undefined}
            >
              {mode.label}
            </ThemedText>
            {performanceMode === mode.value ? (
              <View style={styles.checkmark}>
                <Feather name="check" size={16} color={MiningColors.primary} />
              </View>
            ) : null}
          </Pressable>
        ))}
      </Card>
    </Animated.View>
  );
}

function AlgorithmSelector() {
  const { algorithm, setAlgorithm } = useMining();
  const algorithms: Algorithm[] = ["SHA-256", "Scrypt", "Ethash"];

  return (
    <Animated.View entering={FadeInDown.delay(300).springify()}>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Default Algorithm
      </ThemedText>
      <Card elevation={1}>
        {algorithms.map((algo, index) => (
          <Pressable
            key={algo}
            style={[
              styles.algorithmOption,
              index < algorithms.length - 1 && styles.algorithmOptionBorder,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAlgorithm(algo);
            }}
          >
            <ThemedText type="body">{algo}</ThemedText>
            {algorithm === algo ? (
              <Feather name="check" size={20} color={MiningColors.primary} />
            ) : null}
          </Pressable>
        ))}
      </Card>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { profile, logout } = useMining();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Your mining data will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all mining data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            logout();
          },
        },
      ]
    );
  };

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
        <ProfileSection />

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Wallet
          </ThemedText>
          <Card elevation={1}>
            <SettingsItem
              icon="credit-card"
              title="Wallet Configuration"
              subtitle={
                profile?.walletAddress
                  ? `${profile.walletAddress.slice(0, 8)}...${profile.walletAddress.slice(-6)}`
                  : "Not configured"
              }
              onPress={() => navigation.navigate("Wallet")}
            />
          </Card>
        </Animated.View>

        <PerformanceModeSelector />
        <AlgorithmSelector />

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <Card elevation={1}>
            <SettingsItem
              icon="log-out"
              title="Log Out"
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="trash-2"
              title="Delete Account"
              danger
              onPress={handleDeleteAccount}
            />
          </Card>
        </Animated.View>

        <View style={styles.footer}>
          <ThemedText type="caption" color="muted" style={styles.footerText}>
            CryptoMiner v1.0.0
          </ThemedText>
          <ThemedText type="caption" color="muted" style={styles.footerText}>
            Multi-Algorithm Portable Mining
          </ThemedText>
        </View>
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
    gap: Spacing.md,
  },
  profileCard: {
    padding: Spacing.lg,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  avatarPicker: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MiningColors.surfaceElevated,
  },
  avatarOption: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    borderColor: MiningColors.primary,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsItemPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MiningColors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsItemContent: {
    flex: 1,
  },
  modesCard: {
    padding: 0,
    overflow: "hidden",
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  modeOptionSelected: {
    backgroundColor: MiningColors.surfaceElevated,
  },
  modeOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MiningColors.surfaceElevated,
  },
  checkmark: {
    marginLeft: "auto",
  },
  algorithmOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  algorithmOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MiningColors.surfaceElevated,
  },
  divider: {
    height: 1,
    backgroundColor: MiningColors.surfaceElevated,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
    gap: Spacing.xs,
  },
  footerText: {
    textAlign: "center",
  },
});
