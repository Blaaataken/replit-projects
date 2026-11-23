import { Platform } from "react-native";

export const MiningColors = {
  primary: "#00D4FF",
  secondary: "#00FF88",
  background: "#0A0E27",
  surface: "#1A1F3A",
  surfaceElevated: "#242A4A",
  warning: "#FFB800",
  danger: "#FF3366",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B0",
  textMuted: "#6B7080",
  success: "#00FF88",
  inactive: "#4A4F6A",
};

export const Colors = {
  light: {
    text: MiningColors.textPrimary,
    buttonText: MiningColors.textPrimary,
    tabIconDefault: MiningColors.textSecondary,
    tabIconSelected: MiningColors.primary,
    link: MiningColors.primary,
    backgroundRoot: MiningColors.background,
    backgroundDefault: MiningColors.surface,
    backgroundSecondary: MiningColors.surfaceElevated,
    backgroundTertiary: "#2E3550",
  },
  dark: {
    text: MiningColors.textPrimary,
    buttonText: MiningColors.textPrimary,
    tabIconDefault: MiningColors.textSecondary,
    tabIconSelected: MiningColors.primary,
    link: MiningColors.primary,
    backgroundRoot: MiningColors.background,
    backgroundDefault: MiningColors.surface,
    backgroundSecondary: MiningColors.surfaceElevated,
    backgroundTertiary: "#2E3550",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  mono: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
};
