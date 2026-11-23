import React, { useState } from "react";
import { View, StyleSheet, TextInput, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useMining } from "@/contexts/MiningContext";
import { MiningColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useMining();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const logoScale = useSharedValue(1);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handleLogin = async () => {
    if (!name.trim()) {
      logoScale.value = withSequence(
        withSpring(0.95),
        withSpring(1.05),
        withSpring(1)
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await login(name.trim());
    setIsLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.logoContainer, logoAnimatedStyle]}
        >
          <Image
            source={require("@assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ThemedText type="h1" style={styles.title}>
            CryptoMiner
          </ThemedText>
          <ThemedText type="body" color="muted" style={styles.subtitle}>
            Multi-Algorithm Portable Mining
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.formContainer}
        >
          <View style={styles.inputContainer}>
            <ThemedText type="small" color="muted" style={styles.label}>
              Display Name
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={MiningColors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <Button
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? "Starting..." : "Start Mining"}
          </Button>

          <ThemedText type="caption" color="muted" style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.featuresContainer}
        >
          <View style={styles.featureRow}>
            <View style={styles.feature}>
              <ThemedText type="h4" color="primary">
                3+
              </ThemedText>
              <ThemedText type="caption" color="muted">
                Algorithms
              </ThemedText>
            </View>
            <View style={styles.feature}>
              <ThemedText type="h4" color="secondary">
                P2P
              </ThemedText>
              <ThemedText type="caption" color="muted">
                Group Mining
              </ThemedText>
            </View>
            <View style={styles.feature}>
              <ThemedText type="h4" color="primary">
                Safe
              </ThemedText>
              <ThemedText type="caption" color="muted">
                Thermal Guard
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MiningColors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["4xl"],
  },
  formContainer: {
    width: "100%",
    maxWidth: 340,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    backgroundColor: MiningColors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    color: MiningColors.textPrimary,
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
  button: {
    marginBottom: Spacing.lg,
  },
  disclaimer: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  featuresContainer: {
    marginTop: Spacing["4xl"],
    width: "100%",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  feature: {
    alignItems: "center",
  },
});
