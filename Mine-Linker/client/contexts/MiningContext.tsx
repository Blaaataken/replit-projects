import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Battery from "expo-battery";

export type Algorithm = "SHA-256" | "Scrypt" | "Ethash";
export type PerformanceMode = "low" | "balanced" | "maximum";
export type MiningMode = "solo" | "group";

export interface MiningDevice {
  id: string;
  name: string;
  type: "phone" | "tablet" | "laptop" | "desktop" | "iot";
  performanceTier: "low" | "medium" | "high";
  hashrate: number;
  isConnected: boolean;
  isLocal: boolean;
  lastSeen: number;
}

export interface MiningStats {
  hashrate: number;
  sharesAccepted: number;
  sharesRejected: number;
  uptime: number;
  estimatedEarnings: number;
  temperature: number;
}

export interface MiningSession {
  id: string;
  algorithm: Algorithm;
  mode: MiningMode;
  startTime: number;
  endTime?: number;
  totalShares: number;
  earnings: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarType: "circuit" | "hexagon" | "binary";
  walletAddress: string;
  cryptoType: "BTC" | "ETH" | "LTC";
}

interface MiningContextType {
  isMining: boolean;
  algorithm: Algorithm;
  mode: MiningMode;
  performanceMode: PerformanceMode;
  stats: MiningStats;
  devices: MiningDevice[];
  sessions: MiningSession[];
  profile: UserProfile | null;
  batteryLevel: number;
  isCharging: boolean;
  thermalWarning: boolean;
  startMining: (algorithm: Algorithm, mode: MiningMode) => void;
  stopMining: () => void;
  setAlgorithm: (algorithm: Algorithm) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
  scanForDevices: () => Promise<void>;
  disconnectDevice: (deviceId: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  login: (name: string) => Promise<void>;
}

const MiningContext = createContext<MiningContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: "@mining_profile",
  SESSIONS: "@mining_sessions",
  SETTINGS: "@mining_settings",
};

const getDeviceType = (): MiningDevice["type"] => {
  if (Device.deviceType === Device.DeviceType.PHONE) return "phone";
  if (Device.deviceType === Device.DeviceType.TABLET) return "tablet";
  if (Device.deviceType === Device.DeviceType.DESKTOP) return "desktop";
  return "phone";
};

const getPerformanceTier = (): MiningDevice["performanceTier"] => {
  const totalMemory = Device.totalMemory || 0;
  if (totalMemory > 6 * 1024 * 1024 * 1024) return "high";
  if (totalMemory > 3 * 1024 * 1024 * 1024) return "medium";
  return "low";
};

export function MiningProvider({ children }: { children: React.ReactNode }) {
  const [isMining, setIsMining] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [mode, setMode] = useState<MiningMode>("solo");
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>("balanced");
  const [stats, setStats] = useState<MiningStats>({
    hashrate: 0,
    sharesAccepted: 0,
    sharesRejected: 0,
    uptime: 0,
    estimatedEarnings: 0,
    temperature: 35,
  });
  const [devices, setDevices] = useState<MiningDevice[]>([]);
  const [sessions, setSessions] = useState<MiningSession[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(false);
  const [thermalWarning, setThermalWarning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const miningStartTime = useRef<number>(0);
  const miningInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentSessionRef = useRef<MiningSession | null>(null);

  useEffect(() => {
    loadStoredData();
    setupBatteryMonitoring();
  }, []);

  const loadStoredData = async () => {
    try {
      const [profileData, sessionsData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (profileData) {
        setProfile(JSON.parse(profileData));
        setIsLoggedIn(true);
      }
      if (sessionsData) {
        setSessions(JSON.parse(sessionsData));
      }
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        setPerformanceMode(settings.performanceMode || "balanced");
        setAlgorithm(settings.algorithm || "SHA-256");
      }
    } catch (error) {
      console.error("Failed to load stored data:", error);
    }
  };

  const setupBatteryMonitoring = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      setBatteryLevel(level);
      setIsCharging(state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL);

      Battery.addBatteryLevelListener(({ batteryLevel: level }) => {
        setBatteryLevel(level);
      });

      Battery.addBatteryStateListener(({ batteryState }) => {
        setIsCharging(batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL);
      });
    } catch (error) {
      console.log("Battery monitoring not available");
    }
  };

  const getBaseHashrate = useCallback(() => {
    const tier = getPerformanceTier();
    const baseRates: Record<MiningDevice["performanceTier"], Record<PerformanceMode, number>> = {
      low: { low: 50, balanced: 100, maximum: 150 },
      medium: { low: 150, balanced: 300, maximum: 500 },
      high: { low: 300, balanced: 600, maximum: 1000 },
    };
    return baseRates[tier][performanceMode];
  }, [performanceMode]);

  const startMining = useCallback((selectedAlgorithm: Algorithm, selectedMode: MiningMode) => {
    setIsMining(true);
    setAlgorithm(selectedAlgorithm);
    setMode(selectedMode);
    miningStartTime.current = Date.now();

    const newSession: MiningSession = {
      id: Date.now().toString(),
      algorithm: selectedAlgorithm,
      mode: selectedMode,
      startTime: Date.now(),
      totalShares: 0,
      earnings: 0,
    };
    currentSessionRef.current = newSession;

    miningInterval.current = setInterval(() => {
      const baseHashrate = getBaseHashrate();
      const variance = (Math.random() - 0.5) * 0.2;
      const currentHashrate = baseHashrate * (1 + variance);

      const newShare = Math.random() > 0.05;
      const tempVariance = Math.random() * 10;
      const baseTemp = performanceMode === "maximum" ? 55 : performanceMode === "balanced" ? 45 : 38;

      setStats((prev) => {
        const newStats = {
          hashrate: Math.round(currentHashrate),
          sharesAccepted: prev.sharesAccepted + (newShare ? 1 : 0),
          sharesRejected: prev.sharesRejected + (newShare ? 0 : 1),
          uptime: Math.floor((Date.now() - miningStartTime.current) / 1000),
          estimatedEarnings: prev.estimatedEarnings + (newShare ? 0.00001 * Math.random() : 0),
          temperature: Math.round(baseTemp + tempVariance),
        };

        if (currentSessionRef.current) {
          currentSessionRef.current.totalShares = newStats.sharesAccepted + newStats.sharesRejected;
          currentSessionRef.current.earnings = newStats.estimatedEarnings;
        }

        return newStats;
      });

      setThermalWarning((prev) => {
        const temp = baseTemp + tempVariance;
        return temp > 60;
      });
    }, 1000);
  }, [getBaseHashrate, performanceMode]);

  const stopMining = useCallback(async () => {
    setIsMining(false);
    if (miningInterval.current) {
      clearInterval(miningInterval.current);
      miningInterval.current = null;
    }

    if (currentSessionRef.current) {
      currentSessionRef.current.endTime = Date.now();
      const completedSession = { ...currentSessionRef.current };
      setSessions((prev) => {
        const updated = [completedSession, ...prev].slice(0, 50);
        AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
        return updated;
      });
      currentSessionRef.current = null;
    }

    setStats({
      hashrate: 0,
      sharesAccepted: 0,
      sharesRejected: 0,
      uptime: 0,
      estimatedEarnings: 0,
      temperature: 35,
    });
  }, []);

  const scanForDevices = useCallback(async (): Promise<void> => {
    const localDevice: MiningDevice = {
      id: "local",
      name: Device.deviceName || "This Device",
      type: getDeviceType(),
      performanceTier: getPerformanceTier(),
      hashrate: isMining ? stats.hashrate : 0,
      isConnected: true,
      isLocal: true,
      lastSeen: Date.now(),
    };

    const mockDevices: MiningDevice[] = [
      localDevice,
      {
        id: "device-1",
        name: "iPhone Pro Max",
        type: "phone",
        performanceTier: "high",
        hashrate: Math.round(Math.random() * 500 + 300),
        isConnected: true,
        isLocal: false,
        lastSeen: Date.now(),
      },
      {
        id: "device-2",
        name: "MacBook Air",
        type: "laptop",
        performanceTier: "high",
        hashrate: Math.round(Math.random() * 1000 + 500),
        isConnected: true,
        isLocal: false,
        lastSeen: Date.now(),
      },
    ];

    setDevices(mockDevices);
  }, [isMining, stats.hashrate]);

  const disconnectDevice = useCallback((deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId || d.isLocal));
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = useCallback(async (name: string) => {
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      displayName: name,
      avatarType: "circuit",
      walletAddress: "",
      cryptoType: "BTC",
    };
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.PROFILE, STORAGE_KEYS.SESSIONS, STORAGE_KEYS.SETTINGS]);
    setProfile(null);
    setIsLoggedIn(false);
    setSessions([]);
    if (isMining) {
      stopMining();
    }
  }, [isMining, stopMining]);

  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ performanceMode, algorithm })
    );
  }, [performanceMode, algorithm]);

  return (
    <MiningContext.Provider
      value={{
        isMining,
        algorithm,
        mode,
        performanceMode,
        stats,
        devices,
        sessions,
        profile,
        batteryLevel,
        isCharging,
        thermalWarning,
        startMining,
        stopMining,
        setAlgorithm,
        setPerformanceMode,
        scanForDevices,
        disconnectDevice,
        updateProfile,
        logout,
        isLoggedIn,
        login,
      }}
    >
      {children}
    </MiningContext.Provider>
  );
}

export function useMining() {
  const context = useContext(MiningContext);
  if (!context) {
    throw new Error("useMining must be used within a MiningProvider");
  }
  return context;
}
