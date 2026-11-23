import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import HomeScreen from "@/screens/HomeScreen";
import DevicesScreen from "@/screens/DevicesScreen";
import StatsScreen from "@/screens/StatsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { useTheme } from "@/hooks/useTheme";
import { useMining } from "@/contexts/MiningContext";
import { MiningColors, Spacing, Shadows } from "@/constants/theme";

export type MainTabParamList = {
  Home: undefined;
  Devices: undefined;
  Mining: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MiningFAB({ onPress }: { onPress: () => void }) {
  const { isMining } = useMining();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {
          backgroundColor: isMining ? MiningColors.danger : MiningColors.primary,
        },
        Shadows.fab,
        animatedStyle,
      ]}
    >
      <Feather
        name={isMining ? "square" : "zap"}
        size={28}
        color={MiningColors.textPrimary}
      />
    </AnimatedPressable>
  );
}

function EmptyComponent() {
  return <View />;
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: MiningColors.primary,
        tabBarInactiveTintColor: MiningColors.textSecondary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: MiningColors.background,
            web: MiningColors.background,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({ ios: 88, android: 70, web: 70 }),
          paddingBottom: Platform.select({ ios: 28, android: 12, web: 12 }),
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Mining",
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesScreen}
        options={{
          title: "Devices",
          tabBarIcon: ({ color, size }) => (
            <Feather name="smartphone" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mining"
        component={EmptyComponent}
        options={{
          tabBarButton: (props) => (
            <View style={styles.fabContainer}>
              <MiningFAB onPress={() => props.onPress?.(undefined as any)} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("MiningModal");
          },
        })}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    top: -20,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
