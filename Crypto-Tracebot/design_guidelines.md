# Design Guidelines: Aggressive Crypto Trading Bot

## Design Approach

**Selected Approach:** Design System (Financial Dashboard)  
**Primary References:** Binance, TradingView, Robinhood  
**Justification:** Trading platforms require information density, real-time data clarity, and functional efficiency over decorative aesthetics. Users need to make split-second decisions with confidence.

## Core Design Principles

1. **Data First:** Critical trading information (prices, P&L, positions) dominates the interface
2. **Hierarchical Clarity:** Important metrics are immediately scannable
3. **Professional Trust:** Clean, sophisticated design that conveys reliability and security
4. **Action-Oriented:** Trading controls are prominent and accessible

## Typography

**Font System:** Inter (primary), JetBrains Mono (numeric data)

- **Headlines/Section Titles:** Inter Bold, text-2xl to text-3xl
- **Body/Labels:** Inter Medium, text-sm to text-base
- **Numeric Data:** JetBrains Mono Medium, text-base to text-xl (for prices, balances, percentages)
- **Micro Text:** Inter Regular, text-xs (timestamps, footnotes)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12  
**Dashboard Grid:** 12-column grid with flexible regions for charts, orders, and portfolio

**Key Layouts:**
- Main trading area: 70% width, charts and order execution
- Sidebar: 30% width, portfolio summary and market watch
- Header: Fixed top navigation with key metrics
- Responsive: Stack to single column on mobile

## Component Library

### Core Dashboard Elements

**Price Ticker Bar**
- Horizontal scrolling ticker with major crypto pairs
- Real-time price updates with green/red indicators
- Compact height (h-12), fixed to top

**Trading Chart Panel**
- Large candlestick/line chart (TradingView-style)
- Timeframe selector (1h, 4h, 1d, 1w buttons)
- Technical indicators overlay
- Minimum height: h-96 on desktop

**Portfolio Summary Cards**
- Total balance, 24h P&L, available funds
- Large numeric displays with percentage changes
- Grid layout: grid-cols-3 on desktop, grid-cols-1 on mobile
- Card padding: p-6

**Order Book / Trade History**
- Tabular data with alternating subtle row backgrounds
- Monospace font for prices and amounts
- Compact row height (h-10)
- Scrollable container with max-h-96

**Buy/Sell Interface**
- Dual-panel design (Buy left, Sell right)
- Large percentage buttons for quick amounts (25%, 50%, 75%, 100%)
- Prominent action buttons with adequate padding (h-12)
- Real-time balance display above inputs

**Active Positions Table**
- Data table showing entry price, current price, P&L, actions
- Positive/negative value indicators
- Quick close position buttons per row
- Responsive: horizontal scroll on mobile

**Market Analytics Dashboard**
- News feed cards with thumbnails
- Trend indicators with directional arrows
- Top gainers/losers lists
- AI recommendation cards with confidence scores

**Navigation**
- Top horizontal navigation bar with sections: Dashboard, Trading, Portfolio, Analytics, History, Settings
- User account dropdown on right
- Notification bell icon with badge counter
- Height: h-16, sticky position

### Forms & Inputs

**Trading Inputs**
- Number inputs with large, clear text (h-12)
- Inline validation with immediate feedback
- Helper text below inputs for calculation previews
- Slider controls for leverage/amount selection

**Authentication**
- Clean login/signup forms with social login options
- Two-factor authentication modal
- API key management interface for wallet integration

### Data Displays

**Stat Cards**
- Large numbers prominently displayed (text-3xl to text-4xl)
- Label above or below in smaller text (text-sm)
- Percentage change with icon (↑↓)
- Subtle border, rounded-lg, padding p-6

**Charts**
- Use Chart.js or Recharts for responsive graphs
- Clean axis labels, grid lines
- Tooltips on hover with detailed data
- Legend placement: top-right or bottom

### Overlays

**Modals**
- Order confirmation dialogs (medium size)
- Settings panels (large, scrollable)
- Alert/notification toasts (top-right, auto-dismiss)
- Trade execution feedback (success/error states)

## Images

**Hero Section:** Large abstract crypto/trading themed image showing digital currency symbols, trading graphs, or financial networks. Full-width, h-screen on desktop. Overlay with semi-transparent dark gradient for text readability.

**Marketing/Info Sections:** 
- Security features section: Shield/lock imagery
- AI insights section: Neural network or AI visualization
- Mobile app showcase: Device mockups with trading interface

**Dashboard:** Minimal decorative imagery, focus on data visualization through charts and graphs.

## Animations

**Minimal, Purposeful Motion:**
- Real-time price updates: Subtle flash animation (green/red)
- Order execution: Success checkmark animation
- Loading states: Skeleton screens for data tables
- Page transitions: Minimal fade effects
- Chart updates: Smooth line drawing, no excessive motion

**NO animations on:** Constant data refreshes, background updates, price tickers (would be distracting)

## Responsive Behavior

- **Desktop (1280px+):** Full dashboard with sidebar, multi-column layouts
- **Tablet (768px-1279px):** Collapse sidebar to drawer, maintain two-column where possible
- **Mobile (<768px):** Single column, bottom navigation, swipeable tabs for charts/orders, collapsible sections