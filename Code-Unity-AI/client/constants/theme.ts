import { Platform } from "react-native";

const tintColorLight = "#4FD1C5";
const tintColorDark = "#4FD1C5";

export const Colors = {
  light: {
    text: "#1A202C",
    textSecondary: "#718096",
    buttonText: "#FFFFFF",
    tabIconDefault: "#718096",
    tabIconSelected: tintColorLight,
    link: "#4FD1C5",
    backgroundRoot: "#F7FAFC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#EDF2F7",
    backgroundTertiary: "#E2E8F0",
    primary: "#2D3748",
    accent: "#4FD1C5",
    success: "#48BB78",
    warning: "#ED8936",
    error: "#F56565",
    codeBackground: "#1A202C",
    border: "#E2E8F0",
    cardShadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#A0AEC0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#718096",
    tabIconSelected: tintColorDark,
    link: "#4FD1C5",
    backgroundRoot: "#1A202C",
    backgroundDefault: "#2D3748",
    backgroundSecondary: "#4A5568",
    backgroundTertiary: "#718096",
    primary: "#F7FAFC",
    accent: "#4FD1C5",
    success: "#68D391",
    warning: "#F6AD55",
    error: "#FC8181",
    codeBackground: "#171923",
    border: "#4A5568",
    cardShadow: "rgba(0, 0, 0, 0.3)",
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
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    fontFamily: "Montserrat_700Bold",
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "Montserrat_600SemiBold",
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  link: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  code: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Inter_400Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "Menlo",
    display: "Montserrat_700Bold",
  },
  default: {
    sans: "Inter_400Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
    display: "Montserrat_700Bold",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    display: "Montserrat, system-ui, sans-serif",
  },
});

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
