# Cryptocurrency Mining App - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This app needs user accounts for:
- Wallet address management and earnings tracking
- Device coordination and group mining sessions
- Mining history and performance data sync

**Implementation:**
- Use SSO (Apple Sign-In for iOS, Google Sign-In for Android)
- Mock auth flow in prototype using local state
- Login screen with privacy policy/terms links
- Account screen with logout and nested delete account option
- Profile includes: customizable avatar (generate 3 tech-themed preset avatars - circuit board pattern, hexagonal grid, binary code design), display name, wallet address

### Navigation
**Tab Navigation (4 tabs + FAB):**
- **Home** (mining dashboard & controls)
- **Devices** (P2P device discovery and group management)
- **Stats** (detailed mining statistics and history)
- **Settings** (configuration, wallet, preferences)
- **Floating Action Button** (Start/Stop Mining toggle - center positioned)

### Screen Specifications

#### 1. Home Screen (Mining Dashboard)
**Purpose:** Primary control center for mining operations

**Layout:**
- **Header:** Transparent, title "Mining", right button (notifications bell icon)
- **Main Content:** Scrollable view
- **Safe Area:** top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components:**
- Current mining status card (algorithm, hashrate, device temperature)
- Quick stats grid (shares accepted/rejected, uptime, estimated earnings)
- Active devices preview (show 2-3 connected devices with mini status)
- Algorithm selector dropdown
- Battery/thermal warning banner (conditional)

#### 2. Devices Screen (P2P Coordination)
**Purpose:** Discover, connect, and manage mining devices in group

**Layout:**
- **Header:** Transparent, title "Devices", right button (refresh icon)
- **Main Content:** Scrollable list
- **Safe Area:** top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components:**
- "Scan for Devices" prominent button at top
- Device cards showing: device name, type (phone/laptop/IoT), performance tier, current hashrate, connection status
- Tap card to view device details modal with disconnect option
- Empty state with illustration when no devices discovered

#### 3. Stats Screen (Performance Analytics)
**Purpose:** Detailed mining statistics and earnings history

**Layout:**
- **Header:** Transparent, title "Statistics", right button (calendar icon for date range)
- **Main Content:** Scrollable view
- **Safe Area:** top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components:**
- Time period selector (24h, 7d, 30d, All Time)
- Hashrate line chart
- Earnings breakdown card
- Shares statistics (accepted/rejected ratio)
- Mining session history list

#### 4. Settings Screen
**Purpose:** App configuration and wallet management

**Layout:**
- **Header:** Default navigation header, title "Settings"
- **Main Content:** Scrollable grouped list
- **Safe Area:** top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components:**
- Profile section (avatar, name)
- Wallet Configuration (nested screen with form for wallet address)
- Mining Preferences (algorithm priority, auto-start, thermal limits)
- Performance Mode (Low Power / Balanced / Maximum)
- Notifications toggle
- Account management (logout, delete account)

#### 5. Start/Stop Mining Modal (triggered by FAB)
**Purpose:** Confirm mining start/stop with options

**Layout:**
- **Native Modal:** Bottom sheet style
- **Safe Area:** bottom: insets.bottom + Spacing.xl

**Components:**
- Modal header with "Start Mining" or "Stop Mining" title
- Mode selection: Solo or Group
- Algorithm quick selector (if starting)
- Estimated device impact indicator (battery drain rate)
- Primary action button (Start/Stop)
- Cancel button

#### 6. Wallet Configuration Screen (nested under Settings)
**Purpose:** Enter and validate wallet address

**Layout:**
- **Header:** Default navigation header with back button, title "Wallet"
- **Main Content:** Scrollable form
- **Safe Area:** top: Spacing.xl, bottom: insets.bottom + Spacing.xl

**Components:**
- Wallet address input field with QR scan button
- Cryptocurrency type selector (Bitcoin, Ethereum, etc.)
- Validation status indicator
- Submit button in header (right button)
- Helper text explaining wallet address format

## Design System

### Color Palette
**Theme:** Dark mode optimized for battery efficiency and reduced eye strain during extended monitoring
- **Primary:** Electric Blue (#00D4FF) - mining active state, CTAs
- **Secondary:** Neon Green (#00FF88) - success states, earnings
- **Background:** Deep Navy (#0A0E27) - main background
- **Surface:** Dark Slate (#1A1F3A) - cards, elevated surfaces
- **Warning:** Amber (#FFB800) - thermal warnings
- **Danger:** Crimson (#FF3366) - critical alerts
- **Text Primary:** White (#FFFFFF)
- **Text Secondary:** Light Gray (#A0A0B0)

### Typography
- **Headers:** SF Pro Display (iOS) / Roboto (Android), Bold, 24-28px
- **Subheaders:** SF Pro Text / Roboto, Semibold, 18-20px
- **Body:** SF Pro Text / Roboto, Regular, 16px
- **Captions:** SF Pro Text / Roboto, Regular, 14px
- **Data/Numbers:** SF Mono / Roboto Mono, Medium (for hashrates, stats)

### Visual Design
- Use Feather icons from @expo/vector-icons for all UI elements
- **Floating Action Button (Start/Stop):**
  - 64px diameter circular button
  - Electric Blue when mining stopped, Crimson when mining active
  - Drop shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
  - Icon: zap (lightning) when stopped, square when active
- **Status indicators:** Small circular badges (online: green, offline: gray, warning: amber)
- **Cards:** Dark Slate background, 12px border radius, 16px padding, no shadow
- Device performance tiers use icon badges (smartphone, laptop, cpu icons)
- Hashrate displays use monospace font with gradient effect
- All touchable elements have 50% opacity feedback on press

### Critical Assets
Generate the following unique assets:
1. **Tech-themed avatars (3 variants):** Circuit board pattern, hexagonal grid overlay, binary code design - all in Electric Blue/Neon Green color scheme
2. **Empty state illustration:** Devices screen - simplified peer-to-peer network diagram showing connected nodes
3. **App icon:** Stylized mining pickaxe intersecting with circuit board traces, Electric Blue and Neon Green colors on Deep Navy background

### Interaction Design
- Pull-to-refresh on Home, Devices, Stats screens
- Haptic feedback when mining starts/stops
- Swipe-to-disconnect on device cards
- Long-press on FAB shows quick algorithm selector
- Auto-refresh mining stats every 5 seconds when active
- Throttling warnings appear as non-dismissible banner until resolved

### Accessibility
- Minimum touch target: 44x44px
- High contrast mode support (increase text contrast ratios)
- VoiceOver/TalkBack labels for all mining controls
- Alternative text for all status indicators
- Haptic/audio feedback for critical thermal warnings