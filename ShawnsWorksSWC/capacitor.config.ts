import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shawnsworks.swc',
  appName: 'SHAWNSWORKS',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0b",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0b"
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
