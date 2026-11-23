import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import MiningModal from "@/screens/MiningModal";
import WalletScreen from "@/screens/WalletScreen";
import LoginScreen from "@/screens/LoginScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useMining } from "@/contexts/MiningContext";
import { MiningColors } from "@/constants/theme";

export type RootStackParamList = {
  Main: undefined;
  MiningModal: undefined;
  Wallet: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isLoggedIn } = useMining();

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        contentStyle: {
          backgroundColor: MiningColors.background,
        },
      }}
    >
      {!isLoggedIn ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MiningModal"
            component={MiningModal}
            options={{
              presentation: "modal",
              headerTitle: "Mining Controls",
            }}
          />
          <Stack.Screen
            name="Wallet"
            component={WalletScreen}
            options={{
              headerTitle: "Wallet",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
