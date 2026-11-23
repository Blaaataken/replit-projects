# CryptoMiner - Multi-Algorithm Portable Mining App

A mobile-first cryptocurrency mining application built with Expo and React Native. Features multi-algorithm support, peer-to-peer device coordination, and a modern iOS 26 liquid glass interface design.

## Project Overview

CryptoMiner allows users to mine cryptocurrency using their mobile devices with the following features:
- Multiple mining algorithms (SHA-256, Scrypt, Ethash)
- P2P device discovery and group mining coordination
- Battery and thermal monitoring for safe mining
- Session history and earnings tracking
- Wallet address configuration

## Tech Stack

- **Frontend**: React Native with Expo SDK 54
- **Backend**: Express.js with TypeScript
- **State Management**: React Context API
- **Data Fetching**: TanStack React Query
- **Storage**: AsyncStorage for local persistence
- **Navigation**: React Navigation 7+ with native stack

## Project Structure

```
├── client/                  # Expo mobile app
│   ├── App.tsx             # App entry with providers
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── HeaderTitle.tsx
│   │   ├── ThemedText.tsx
│   │   ├── ThemedView.tsx
│   │   └── KeyboardAwareScrollViewCompat.tsx
│   ├── constants/          # Theme and design tokens
│   │   └── theme.ts        # MiningColors, Spacing, Fonts
│   ├── contexts/           # React Context providers
│   │   └── MiningContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useScreenOptions.ts
│   ├── lib/                # Utilities
│   │   └── query-client.ts
│   ├── navigation/         # Navigation structure
│   │   ├── RootStackNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   └── screens/            # Screen components
│       ├── HomeScreen.tsx
│       ├── DevicesScreen.tsx
│       ├── StatsScreen.tsx
│       ├── SettingsScreen.tsx
│       ├── LoginScreen.tsx
│       ├── MiningModal.tsx
│       └── WalletScreen.tsx
├── server/                  # Express backend
│   └── index.ts            # API server
├── assets/                  # Static assets
│   └── images/             # Icons, splash, avatars
└── shared/                  # Shared types/utilities
```

## Key Features

### Mining Context (`client/contexts/MiningContext.tsx`)
- Mining start/stop with algorithm selection
- Performance modes: low, balanced, maximum
- Device discovery simulation for P2P
- Battery monitoring with expo-battery
- Session history persistence

### Navigation
- Login flow (when not logged in)
- Main tabs: Home, Devices, Stats, Settings
- Center FAB for quick mining access
- Modal screens: MiningModal, WalletScreen

### Design System
- Theme colors defined in `client/constants/theme.ts`
- Primary: Electric Blue (#00D4FF)
- Secondary: Neon Green (#00FF88)
- Background: Deep Navy (#0A0E27)

## Development

### Running the App
```bash
npm run all:dev    # Runs both Expo and Express servers
```

- Expo dev server: port 8081
- Express API server: port 5000

### Path Aliases
- `@/` → `./client/`
- `@shared/` → `./shared/`
- `@assets/` → `./assets/`

### Testing
- Scan QR code with Expo Go to test on physical device
- Web version available at port 5000 (proxied through Express)

## User Preferences

None recorded yet.

## Recent Changes

- **Dec 6, 2025**: Fixed `@assets` path alias in babel.config.js and tsconfig.json to resolve image import errors in LoginScreen
