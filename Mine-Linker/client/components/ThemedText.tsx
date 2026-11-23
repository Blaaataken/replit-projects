import { Text, type TextProps } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Typography, MiningColors, Fonts } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "caption" | "link" | "mono";
  color?: "primary" | "secondary" | "muted" | "warning" | "danger" | "success";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  color,
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    if (color) {
      switch (color) {
        case "primary":
          return MiningColors.primary;
        case "secondary":
          return MiningColors.secondary;
        case "muted":
          return MiningColors.textMuted;
        case "warning":
          return MiningColors.warning;
        case "danger":
          return MiningColors.danger;
        case "success":
          return MiningColors.success;
      }
    }

    if (isDark && darkColor) {
      return darkColor;
    }

    if (!isDark && lightColor) {
      return lightColor;
    }

    if (type === "link") {
      return theme.link;
    }

    return theme.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "h1":
        return Typography.h1;
      case "h2":
        return Typography.h2;
      case "h3":
        return Typography.h3;
      case "h4":
        return Typography.h4;
      case "body":
        return Typography.body;
      case "small":
        return Typography.small;
      case "caption":
        return Typography.caption;
      case "link":
        return Typography.link;
      case "mono":
        return { ...Typography.mono, fontFamily: Fonts?.mono };
      default:
        return Typography.body;
    }
  };

  return (
    <Text style={[{ color: getColor() }, getTypeStyle(), style]} {...rest} />
  );
}
