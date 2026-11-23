import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import LibraryStackNavigator from "@/navigation/LibraryStackNavigator";
import LearnStackNavigator from "@/navigation/LearnStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { BorderRadius, Shadows } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  LibraryTab: undefined;
  NewChat: undefined;
  LearnTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function EmptyComponent() {
  return null;
}

function FABButton() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Chat", {});
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.accent,
          transform: [{ scale: pressed ? 0.92 : 1 }],
          opacity: pressed ? 0.9 : 1,
        },
        Shadows.lg,
      ]}
    >
      <Feather name="plus" size={28} color="#FFFFFF" />
    </Pressable>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 68,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStackNavigator}
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewChat"
        component={EmptyComponent}
        options={{
          tabBarButton: () => <FABButton />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tab.Screen
        name="LearnTab"
        component={LearnStackNavigator}
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 20 : 10,
  },
});
