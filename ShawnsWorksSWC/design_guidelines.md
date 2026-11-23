# SHAWNSWORKS (SWC) Design Guidelines

## Design Approach
**Hybrid: Crypto Platform Reference + Material Design System**

Drawing inspiration from leading crypto platforms (Uniswap, Phantom, Coinbase) while using Material Design's data-density patterns for complex information displays. The design emphasizes clarity, trust, and technological sophistication appropriate for a multi-chain AI-powered platform.

## Typography System
- **Primary Font**: Inter or DM Sans (via Google Fonts) - clean, technical, excellent for data
- **Accent Font**: Space Grotesk or JetBrains Mono (for addresses, technical data)
- **Scale**: 
  - Hero: text-5xl to text-7xl (bold/800)
  - Section Headers: text-3xl to text-4xl (semibold/600)
  - Card Titles: text-xl (semibold/600)
  - Body: text-base (regular/400)
  - Data/Numbers: text-lg to text-2xl (medium/500)
  - Labels: text-sm (medium/500)
  - Technical/Addresses: text-xs mono (regular/400)

## Layout & Spacing System
**Tailwind Units**: Primary spacing scale of 4, 6, 8, 12, 16, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl
- Dashboard grids: gap-4 to gap-6

## Core Components

### Navigation
- Fixed top navigation (sticky)
- Logo left, primary actions right (Connect Wallet, Network Selector)
- Network status indicator (live connection badges)
- Wallet address display (truncated with copy function)
- Mobile: Hamburger menu with slide-out drawer

### Hero Section
- Full-width (w-full), moderate height (min-h-[60vh])
- Centered content with max-w-4xl
- Large headline emphasizing "Multi-Chain AI Utility"
- Dual CTAs: "Launch App" (primary) + "View Documentation"
- Animated network connection visualization (subtle canvas/SVG)
- Trust indicators below CTAs: "Trusted by X users" + network logos
- Background: Subtle gradient mesh or geometric patterns

### Dashboard Layout
- Sidebar navigation (hidden on mobile, toggle button)
- Main content area: Grid-based cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Quick stats bar at top (4 columns: Total Balance, Active Networks, Rewards Earned, Gas Saved)
- Each stat: Large number display + percentage change indicator + mini sparkline

### Wallet Balance Cards
- Card design: Elevated appearance with subtle shadow
- Header: Network icon + name + "Connected" status
- Main content: Large balance display (text-3xl) + USD equivalent
- Footer: Quick actions (Send, Receive, Swap)
- Multi-network view: Stacked cards with collapse/expand

### Cross-Chain Bridge Interface
- Two-column layout: Source → Destination
- Each column: Network selector dropdown + amount input field
- Center: Swap direction button (bidirectional arrow)
- Below: Route visualization showing AI optimization path
- Fee comparison table (3 columns: Network, Fee, Time)
- Prominent "Bridge Tokens" CTA at bottom

### Price Aggregator Section
- Full-width data table or card grid
- Columns: Token, Price, 24h Change, Volume, Actions
- Real-time update indicators (pulsing dot)
- Mini charts inline (sparklines showing 7-day trend)
- Filter/sort controls above table
- Pagination at bottom

### Staking Rewards Calculator
- Two-column layout: Input form + Results display
- Input: Token amount, Duration slider, Network selector
- Results card: Projected rewards (large text-4xl), APY percentage, breakdown table
- Visual: Progress bar showing reward accumulation over time
- CTA: "Start Staking"

### Network Status Dashboard
- Grid of network status cards (3-4 columns)
- Each card: Network logo, name, status indicator (Live/Congested/Down)
- Current gas price + trend arrow
- Connected users count
- Quick link to network explorer

### Footer
- Comprehensive multi-column layout (4 columns on desktop)
- Column 1: Logo + tagline + social links
- Column 2: Product (Dashboard, Bridge, Staking, Rewards)
- Column 3: Resources (Docs, API, GitHub, Whitepaper)
- Column 4: Community (Discord, Twitter, Telegram) + Newsletter signup
- Bottom bar: Copyright, Terms, Privacy, Security Audit links

## Component Patterns

### Cards
- Consistent padding: p-6 to p-8
- Rounded corners: rounded-xl to rounded-2xl
- Subtle elevation with shadows
- Hover state: Slight lift effect (translate-y)

### Buttons
- Primary: Solid, rounded-lg, px-6 py-3, text-base font-medium
- Secondary: Outlined, same sizing
- Icon buttons: Square aspect ratio, rounded-lg, p-3
- Button groups: flex gap-3

### Data Display
- Key-value pairs: flex justify-between items-center
- Number emphasis: Larger, medium weight font
- Change indicators: Inline with arrows (↑↓) and percentage
- Tables: Striped rows, hover highlighting, fixed header on scroll

### Input Fields
- Consistent height: h-12 to h-14
- Rounded: rounded-lg
- Labels above inputs: text-sm font-medium mb-2
- Helper text below: text-xs
- Network/token selectors: Dropdown with icons

### Status Indicators
- Live badges: Small pill shape, pulsing animation
- Network indicators: Colored dots (8px diameter)
- Loading states: Skeleton screens matching content structure

## Iconography
**Library**: Heroicons (outline for navigation, solid for status)
- Network icons: Custom SVG logos for each blockchain
- Action icons: Swap (arrows), Send (paper plane), Receive (download)
- Status icons: Check (success), Warning (alert), Info (circle-i)

## Images
**Hero Section**: Abstract 3D render showing interconnected network nodes, geometric shapes representing different blockchains converging. Should convey technology, connectivity, and AI sophistication. Placement: Background with overlay gradient for text readability.

## Responsive Behavior
- Desktop (lg+): Full sidebar, 3-column grids, expanded data tables
- Tablet (md): 2-column grids, collapsible sidebar
- Mobile (base): Single column, stacked layouts, hamburger menu, simplified data cards

## Animation Guidelines
**Minimal and Purposeful**
- Data updates: Gentle number count-up animation
- Chart transitions: Smooth line/bar animations on load
- Loading states: Subtle skeleton pulse
- No decorative scroll animations
- Focus on real-time data updates as primary motion