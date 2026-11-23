import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useMining } from "@/contexts/MiningContext";
import { MiningColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

type CryptoType = "BTC" | "ETH" | "LTC";

const cryptoInfo: Record<CryptoType, { name: string; prefix: string; length: number }> = {
  BTC: { name: "Bitcoin", prefix: "1, 3, or bc1", length: 34 },
  ETH: { name: "Ethereum", prefix: "0x", length: 42 },
  LTC: { name: "Litecoin", prefix: "L, M, or ltc1", length: 34 },
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile, updateProfile } = useMining();

  const [walletAddress, setWalletAddress] = useState(profile?.walletAddress || "");
  const [cryptoType, setCryptoType] = useState<CryptoType>(profile?.cryptoType || "BTC");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateAddress = (address: string, type: CryptoType) => {
    if (!address) {
      setIsValid(null);
      return;
    }

    const info = cryptoInfo[type];
    let valid = false;

    switch (type) {
      case "BTC":
        valid = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);
        break;
      case "ETH":
        valid = /^0x[a-fA-F0-9]{40}$/.test(address);
        break;
      case "LTC":
        valid = /^(L|M|ltc1)[a-zA-Z0-9]{25,62}$/.test(address);
        break;
    }

    setIsValid(valid);
  };

  const handleAddressChange = (text: string) => {
    setWalletAddress(text);
    validateAddress(text, cryptoType);
  };

  const handleCryptoChange = (type: CryptoType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCryptoType(type);
    validateAddress(walletAddress, type);
  };

  const handleSave = async () => {
    if (!walletAddress) {
      Alert.alert("Error", "Please enter a wallet address");
      return;
    }

    if (isValid === false) {
      Alert.alert(
        "Invalid Address",
        `The wallet address doesn't appear to be a valid ${cryptoInfo[cryptoType].name} address. Save anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save Anyway",
            onPress: async () => {
              await updateProfile({ walletAddress, cryptoType });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }

    await updateProfile({ walletAddress, cryptoType });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleScanQR = () => {
    Alert.alert(
      "QR Scanner",
      "To scan a wallet QR code, please use the Expo Go app on your physical device.",
      [{ text: "OK" }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Cryptocurrency
          </ThemedText>
          <View style={styles.cryptoContainer}>
            {(Object.keys(cryptoInfo) as CryptoType[]).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.cryptoOption,
                  cryptoType === type && styles.cryptoOptionSelected,
                ]}
                onPress={() => handleCryptoChange(type)}
              >
                <ThemedText
                  type="body"
                  color={cryptoType === type ? "primary" : undefined}
                  style={cryptoType === type ? styles.cryptoTextSelected : undefined}
                >
                  {type}
                </ThemedText>
                <ThemedText type="caption" color="muted">
                  {cryptoInfo[type].name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Wallet Address
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isValid === true && styles.inputValid,
                isValid === false && styles.inputInvalid,
              ]}
              placeholder={`Enter ${cryptoInfo[cryptoType].name} address`}
              placeholderTextColor={MiningColors.textMuted}
              value={walletAddress}
              onChangeText={handleAddressChange}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              numberOfLines={2}
            />
            <Pressable style={styles.scanButton} onPress={handleScanQR}>
              <Feather name="camera" size={20} color={MiningColors.primary} />
            </Pressable>
          </View>

          {isValid !== null ? (
            <View style={styles.validationRow}>
              <Feather
                name={isValid ? "check-circle" : "alert-circle"}
                size={16}
                color={isValid ? MiningColors.success : MiningColors.danger}
              />
              <ThemedText
                type="small"
                color={isValid ? "success" : "danger"}
              >
                {isValid ? "Valid address format" : "Invalid address format"}
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card elevation={1} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="info" size={16} color={MiningColors.primary} />
              <View style={styles.infoContent}>
                <ThemedText type="small">
                  {cryptoInfo[cryptoType].name} addresses typically start with{" "}
                  <ThemedText type="small" color="primary">
                    {cryptoInfo[cryptoType].prefix}
                  </ThemedText>
                </ThemedText>
                <ThemedText type="caption" color="muted" style={styles.infoSubtext}>
                  Make sure to double-check your address before mining to ensure you receive your earnings.
                </ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.actions}
        >
          <Button onPress={handleSave}>Save Wallet</Button>
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
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  cryptoContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  cryptoOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: MiningColors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cryptoOptionSelected: {
    borderColor: MiningColors.primary,
    backgroundColor: MiningColors.primary + "15",
  },
  cryptoTextSelected: {
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    minHeight: Spacing.inputHeight * 1.5,
    backgroundColor: MiningColors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: MiningColors.textPrimary,
    fontSize: 14,
    fontFamily: Fonts?.mono,
    borderWidth: 2,
    borderColor: "transparent",
    textAlignVertical: "top",
  },
  inputValid: {
    borderColor: MiningColors.success,
  },
  inputInvalid: {
    borderColor: MiningColors.danger,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: MiningColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  infoCard: {
    marginTop: Spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoSubtext: {
    marginTop: Spacing.xs,
  },
  actions: {
    marginTop: "auto",
    paddingTop: Spacing.xl,
  },
});
