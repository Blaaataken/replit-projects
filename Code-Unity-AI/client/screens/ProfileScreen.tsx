import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, Switch, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

type SettingItemProps = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  destructive?: boolean;
};

function SettingItem({ icon, title, subtitle, onPress, trailing, destructive }: SettingItemProps) {
  const { theme } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingItem,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed && onPress ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? "#F5656520" : theme.accent + "20" }]}>
        <Feather name={icon as any} size={18} color={destructive ? "#F56565" : theme.accent} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText 
          type="body" 
          style={[styles.settingTitle, destructive && { color: "#F56565" }]}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>{subtitle}</ThemedText>
        ) : null}
      </View>
      {trailing ? (
        trailing
      ) : onPress ? (
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <View style={styles.settingsGroup}>
      <ThemedText type="small" style={[styles.groupTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
      <View style={[styles.groupContent, { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.md }]}>
        {React.Children.map(children, (child, index) => (
          <View>
            {child}
            {index < React.Children.count(children) - 1 ? (
              <View style={[styles.separator, { backgroundColor: theme.border }]} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleToggleNotifications = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(value);
  };

  const handleToggleHaptic = async (value: boolean) => {
    if (value) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHapticEnabled(value);
  };

  const handleLogout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <KeyboardAwareScrollViewCompat
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
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileSection}>
        <Image
          source={require("../../assets/images/default-avatar.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
        <ThemedText type="h3" style={styles.userName}>Developer</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          developer@example.com
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <SettingsGroup title="PREFERENCES">
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle={isDark ? "On" : "Off"}
            trailing={
              <View style={[styles.themeIndicator, { backgroundColor: isDark ? theme.accent : theme.backgroundSecondary }]}>
                <Feather name={isDark ? "moon" : "sun"} size={14} color={isDark ? "#fff" : theme.text} />
              </View>
            }
          />
          <SettingItem
            icon="bell"
            title="Notifications"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.backgroundSecondary, true: theme.accent }}
                thumbColor={Platform.OS === "ios" ? undefined : "#fff"}
              />
            }
          />
          <SettingItem
            icon="smartphone"
            title="Haptic Feedback"
            trailing={
              <Switch
                value={hapticEnabled}
                onValueChange={handleToggleHaptic}
                trackColor={{ false: theme.backgroundSecondary, true: theme.accent }}
                thumbColor={Platform.OS === "ios" ? undefined : "#fff"}
              />
            }
          />
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <SettingsGroup title="AI BEHAVIOR">
          <SettingItem
            icon="cpu"
            title="Response Style"
            subtitle="Concise"
            onPress={() => {}}
          />
          <SettingItem
            icon="message-square"
            title="Code Language"
            subtitle="TypeScript"
            onPress={() => {}}
          />
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <SettingsGroup title="ABOUT">
          <SettingItem
            icon="shield"
            title="Privacy Policy"
            onPress={() => {}}
          />
          <SettingItem
            icon="file-text"
            title="Terms of Service"
            onPress={() => {}}
          />
          <SettingItem
            icon="info"
            title="Version"
            subtitle="1.0.0"
          />
        </SettingsGroup>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <SettingsGroup title="ACCOUNT">
          <SettingItem
            icon="log-out"
            title="Log Out"
            destructive
            onPress={handleLogout}
          />
        </SettingsGroup>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  settingsGroup: {
    marginBottom: Spacing.xl,
  },
  groupTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 12,
  },
  groupContent: {
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  themeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
