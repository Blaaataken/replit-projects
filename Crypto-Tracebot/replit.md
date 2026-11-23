# CryptoTrader Pro - Aggressive AI Trading Bot

## Overview

CryptoTrader Pro is an automated cryptocurrency trading platform with AI-powered market insights and aggressive trading strategies. The application targets 10% profit with 15% stop-loss protection, providing real-time portfolio tracking, automated bot trading, and comprehensive market analytics through a professional financial dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as the build tool and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management and caching
- Shadcn UI component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens

**Design System:**
- Professional financial dashboard aesthetic inspired by Binance, TradingView, and Robinhood
- Typography: Inter for UI, JetBrains Mono for numeric data
- Custom color system with HSL-based theming supporting light/dark modes
- Component library built on Radix UI primitives for accessibility
- Responsive 12-column grid layout optimized for trading interfaces

**State Management Approach:**
- Server state managed through React Query with WebSocket real-time updates
- Client state managed through React hooks and component state
- WebSocket connection invalidates relevant queries on data updates (prices, trades, positions)
- Optimistic UI updates for immediate user feedback

**Key UI Components:**
- Price ticker with real-time scrolling market data
- Trading chart with candlestick visualization (Recharts)
- Portfolio summary dashboard with P&L tracking
- Live positions table with profit/loss calculations
- AI insights panel with trading recommendations
- Bot settings panel with strategy configuration

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js REST API
- TypeScript throughout the backend
- WebSocket server (ws library) for real-time data streaming
- Drizzle ORM for database operations
- PostgreSQL as the primary database

**API Design:**
- RESTful endpoints for CRUD operations
- WebSocket endpoint at `/ws` for real-time price updates and trade notifications
- Session-based architecture (single user mode with default "demo-trader" account)
- Request/response logging middleware for debugging

**Core Services:**

1. **Market Data Service** (`server/market-data.ts`)
   - Simulated market data with configurable base prices for 8 crypto pairs
   - Price volatility simulation (0.2% max change per 5-second interval)
   - Chart data generation for various timeframes
   - Real-time price updates broadcast via WebSocket

2. **AI Service** (`server/ai-service.ts`)
   - OpenAI GPT-5 integration via Replit AI Integrations
   - Analyzes market data to generate buy/sell/hold recommendations
   - Returns confidence scores and reasoning for each recommendation
   - JSON-structured responses for type-safe consumption

3. **Trading Bot** (`server/trading-bot.ts`)
   - Automated trading execution based on configurable strategies
   - Aggressive, moderate, and conservative strategy modes
   - Position management with profit targets and stop-loss thresholds
   - 5-second trading cycle interval
   - Virtual funds tracking ($10,000 default)

4. **Storage Layer** (`server/storage.ts`)
   - Abstraction layer over Drizzle ORM
   - Operations for users, trades, positions, holdings, and bot settings
   - Type-safe database queries with Drizzle's query builder

**WebSocket Event System:**
- `prices`: Broadcasts market price updates every 2 seconds
- `trade`: Notifies when bot executes trades
- `position_closed`: Notifies when positions are closed
- Client automatically invalidates React Query cache on relevant events

### Data Storage Solutions

**Database Schema (PostgreSQL):**

1. **Users Table**
   - UUID primary key
   - Username and password fields
   - Single default user for MVP ("demo-trader")

2. **Portfolio Holdings Table**
   - Tracks owned cryptocurrency quantities
   - Average buy price for P&L calculations
   - References user and symbol

3. **Trades Table**
   - Complete trade history (buy/sell)
   - Tracks quantity, price, total, and execution time
   - `isBot` flag distinguishes automated from manual trades
   - Status field for trade state management

4. **Positions Table**
   - Active trading positions
   - Entry price, quantity, profit target, stop-loss
   - Status tracking (open/closed)
   - Associated with trading strategies

5. **Bot Settings Table**
   - User-specific bot configuration
   - Trading pairs selection
   - Profit target and stop-loss percentages
   - Maximum trade amount
   - Strategy selection (aggressive/moderate/conservative)
   - Active status toggle

6. **Market Data Table**
   - Historical price and volume data storage
   - OHLC (Open, High, Low, Close) data points
   - Volume tracking

**Database Configuration:**
- Drizzle Kit for schema management and migrations
- Connection pooling via node-postgres (pg)
- Environment-based connection string (`DATABASE_URL`)

### Authentication and Authorization

**Current Implementation:**
- Single-user MVP mode with hardcoded "demo-trader" user
- Session management infrastructure present (express-session, connect-pg-simple)
- Passport.js authentication framework included but not actively enforced
- All API endpoints currently accessible without authentication checks

**Future-Ready Architecture:**
- Session store configured for PostgreSQL
- User schema supports password hashing
- Authentication middleware prepared for multi-user expansion

## External Dependencies

### Third-Party Services

1. **OpenAI API (via Replit AI Integrations)**
   - Model: GPT-5
   - Purpose: Market analysis and trading recommendations
   - Access: Through Replit's AI Integrations proxy
   - Environment variables: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

### Key NPM Packages

**Frontend:**
- `@tanstack/react-query` - Server state management and caching
- `@radix-ui/*` - Accessible UI primitives (20+ component packages)
- `recharts` - Chart visualization library
- `wouter` - Lightweight routing
- `tailwindcss` - Utility-first CSS framework
- `zod` - Runtime type validation
- `date-fns` - Date manipulation

**Backend:**
- `express` - Web server framework
- `drizzle-orm` - Type-safe ORM
- `pg` - PostgreSQL client
- `ws` - WebSocket server
- `openai` - OpenAI API client
- `zod` - Schema validation (shared with frontend)

**Build Tools:**
- `vite` - Frontend build tool and dev server
- `esbuild` - Backend bundler for production
- `tsx` - TypeScript execution for development
- `drizzle-kit` - Database migration tool

### Database

**PostgreSQL:**
- Required environment variable: `DATABASE_URL`
- Connection managed through pg Pool
- Schema migrations in `./migrations` directory
- Drizzle ORM configuration in `drizzle.config.ts`

### Development Tools

**Replit-Specific Integrations:**
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development mode indicator
- Only loaded in non-production environments within Replit