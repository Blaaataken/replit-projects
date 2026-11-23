# SHAWNSWORKS (SWC) Multi-Chain AI Trading Platform

## Overview

SHAWNSWORKS is a revolutionary multi-chain cryptocurrency platform that bridges major blockchain networks (Ethereum, Binance Smart Chain, Polygon) with AI-powered trading capabilities, cross-chain bridging, and intelligent staking optimization. The platform provides a comprehensive dashboard for portfolio management, automated trading signals, gas optimization, and staking rewards tracking.

## User Preferences

Preferred communication style: Simple, everyday language.
Maintenance Mode: AI-maintained with continuous updates and improvements.

## Quick Start for AI Maintenance Agents

### Most Critical Files (Watch These)
1. **server/db.ts** - Database connection (uses postgres-js, NOT Neon WebSocket)
2. **server/routes.ts** - API endpoints
3. **client/src/components/navigation.tsx** - Main navigation
4. **client/src/App.tsx** - Routing configuration
5. **shared/schema.ts** - Data models

### Daily Maintenance Checklist
- [ ] Check workflow logs for errors: `refresh_all_logs`
- [ ] Verify database connection: `curl http://localhost:5000/api/networks`
- [ ] Test all API endpoints after changes
- [ ] Rebuild after dependency changes: `npm run build`
- [ ] Restart workflow: `restart_workflow`

### Common Issues & Fixes

**Issue: App won't start**
- Check if DATABASE_URL is set: `view_env_vars`
- Verify postgres is installed: check package.json for "postgres" package
- Database connection error? Ensure db.ts uses postgres-js driver, NOT neonConfig WebSocket

**Issue: Links don't work**
- Verify all `<Link>` components use `href` not `to`
- Check wouter imports are correct
- Ensure Footer uses wouter `Link` not HTML `<a>` tags

**Issue: Can't republish**
- Build succeeds but deploy fails? Check DATABASE_URL in production secrets
- Ensure all env vars set: SESSION_SECRET, OPENAI_API_KEY, DATABASE_URL
- Clear any failed deployment state first

### Deployment Status
- **Last Successful Build**: December 5, 2025
- **Database**: PostgreSQL (Neon serverless) - uses postgres-js driver
- **Current Status**: Production-ready, all API endpoints working
- **Mobile Deployment**: Android/Capacitor configured, PWA ready

### Mobile & PWA Configuration
- **Capacitor**: Configured for Android builds (appId: com.shawnsworks.swc)
- **Icons**: Full set generated (72-512px for Android/PWA, 120-180px for iOS)
- **Service Worker**: Offline-capable with caching strategies
- **Manifest**: Complete with shortcuts and installability
- **Documentation**: See `docs/APP_STORE_SUBMISSION.md` and `docs/GITHUB_REPOSITORY.md`

### Mobile Build Commands
```bash
npm run build              # Build web app
npx cap sync android       # Sync to Android
npx cap open android       # Open in Android Studio
```

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router. Main routes include:
- `/` - Landing page with hero section and feature highlights
- `/dashboard` - Portfolio overview and statistics
- `/trading` - AI trading signals and performance metrics
- `/bridge` - Cross-chain asset transfer interface
- `/staking` - Staking position management and rewards tracking

**UI Framework**: shadcn/ui component library with Radix UI primitives, providing accessible and customizable components. Styling uses Tailwind CSS with a custom design system inspired by crypto platforms (Uniswap, Phantom, Coinbase) combined with Material Design patterns for data density.

**State Management**: 
- TanStack Query (React Query) for server state management, caching, and API data fetching
- React Context for theme management (dark/light mode)
- Local component state for UI interactions

**Design System**: 
- Custom Tailwind configuration with HSL color variables for theming
- Typography: Inter/DM Sans for primary text, Space Grotesk/JetBrains Mono for technical data
- Spacing scale: Tailwind's 4, 6, 8, 12, 16, 24 unit system
- Custom elevation system with hover states (`hover-elevate`, `active-elevate-2`)

**Type Safety**: Full TypeScript coverage with path aliases configured:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Backend Architecture

**Runtime**: Node.js with Express.js framework running in ESM mode.

**API Structure**: RESTful API endpoints organized by resource:
- `/api/networks` - Blockchain network information
- `/api/portfolios` - User portfolio positions across networks
- `/api/trading/signals` - AI-generated trading recommendations
- `/api/staking/positions` - Staking positions and rewards
- `/api/transactions` - Transaction history

**AI Integration**: OpenAI API integration for generating:
- Trading signals with buy/sell/hold recommendations
- Confidence scores and price targets
- Gas optimization routing for cross-chain transfers
- Uses GPT-5 model for analysis

**Data Layer**: 
- Database: PostgreSQL (Neon serverless) with Drizzle ORM
- Schema management: Drizzle Kit for migrations
- In-memory storage implementation (MemStorage) for development/testing

**Session Management**: Connect-pg-simple for PostgreSQL-backed session storage with Express sessions.

### Database Schema

**Networks Table**:
- Multi-chain support (Ethereum, BSC, Polygon)
- Tracks chain ID, RPC endpoints, explorer URLs, gas prices
- Active/inactive status flag

**Portfolios Table**:
- User token balances per network
- USD value calculations
- Timestamp tracking for updates

**Trading Signals Table**:
- AI-generated trading recommendations
- Action type (buy/sell/hold), confidence scores
- Target prices and reasoning
- Expiration timestamps

**Staking Positions Table**:
- Network-specific staking records
- APY tracking, start/end dates
- Accumulated rewards calculation

**Transactions Table**:
- Cross-chain transaction history
- Status tracking (pending/completed/failed)
- Network routing information
- Fee calculations

**Price Data Table**:
- Real-time cryptocurrency price tracking
- 24-hour volume and change percentages
- Market cap data

### Development Environment

**Build Process**:
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js` with ESM output
- Development: tsx for TypeScript execution with hot reload

**Development Tools**:
- Replit-specific plugins for error overlay, cartographer, and dev banner
- PostCSS with Tailwind and Autoprefixer
- TypeScript strict mode with path resolution

**Code Organization**:
- `client/` - React frontend application
- `server/` - Express backend and API routes
- `shared/` - Shared TypeScript types and schemas (Drizzle + Zod)
- Monorepo structure with shared code between client and server

## External Dependencies

### Core Infrastructure
- **Neon Database** (@neondatabase/serverless): Serverless PostgreSQL database hosting
- **OpenAI API**: AI-powered trading signal generation and gas optimization analysis using GPT-5

### Frontend Libraries
- **React 18**: UI framework with React DOM
- **Wouter**: Lightweight client-side routing
- **TanStack Query v5**: Server state management and data fetching
- **shadcn/ui**: Pre-built accessible component library based on Radix UI
- **Radix UI**: Headless UI primitives (dialogs, dropdowns, popovers, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Icons**: Additional icons (blockchain network logos)

### Backend Libraries
- **Express.js**: Web server framework
- **Drizzle ORM**: Type-safe PostgreSQL ORM
- **Drizzle Zod**: Schema validation integration
- **Connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **esbuild**: Fast JavaScript bundler for server code
- **tsx**: TypeScript execution for development

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: React Hook Form + Zod integration

### UI Enhancement
- **class-variance-authority**: Component variant styling
- **clsx** + **tailwind-merge**: Conditional className utilities
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider component
- **date-fns**: Date manipulation and formatting
- **vaul**: Drawer component primitive

## Maintenance & Continuous Improvement Guide

### For Future AI Agents Maintaining This App

#### Critical Knowledge
1. **Database Connection**: Uses `postgres-js` driver (NOT Neon serverless WebSocket)
   - File: `server/db.ts`
   - Connection string from DATABASE_URL environment variable
   - Serverless optimized: max 1 connection, prepared statements disabled

2. **Frontend Routing**: Uses Wouter (lightweight router)
   - All navigation must use `Link` component with `href` prop
   - DO NOT use HTML `<a href="#">` - these are dead links
   - All footer/header links must be Wouter Link components

3. **State Management**: TanStack Query v5
   - Query keys as arrays: `{ queryKey: ['/api/endpoint'] }`
   - Cache invalidation after mutations
   - Use `apiRequest` from `@lib/queryClient` for POST/PATCH/DELETE

4. **API Patterns**
   - All endpoints in `/server/routes.ts`
   - Use storage interface for data operations
   - Validate inputs with Zod schemas before storage calls
   - Return proper status codes and error messages

#### Updating Features

**To Add New Page:**
1. Create file in `client/src/pages/[name].tsx`
2. Add route in `client/src/App.tsx`
3. Add nav link in `client/src/components/navigation.tsx`
4. Test routing works

**To Add New API Endpoint:**
1. Update schema in `shared/schema.ts` if needed
2. Add storage method in `server/storage.ts`
3. Add route in `server/routes.ts`
4. Test with curl from command line

**To Deploy Changes:**
1. Make code changes
2. Test locally: `npm run build` succeeds?
3. Restart workflow: `restart_workflow`
4. Verify all endpoints respond
5. When ready: Click publish button in Replit

#### Known Workarounds
- PostCSS warning about `from` option: Harmless, ignore
- Chunk size warning in build: App works fine, frontend code is large
- First deploy requires manual DATABASE_URL setup in production secrets

#### Performance Optimization Ideas (Future)
- Code-split React components (app is ~684kb minified)
- Add caching headers for static assets
- Implement pagination for portfolio data
- Add compression middleware to Express
- Consider moving heavy computations to edge functions

#### Testing Checklist Before Deploy
- [ ] `curl http://localhost:5000/` returns HTML
- [ ] `curl http://localhost:5000/api/networks` returns data
- [ ] `curl http://localhost:5000/api/portfolios` returns portfolio data
- [ ] Navigation links work in browser
- [ ] No console errors in browser DevTools
- [ ] Dark mode toggle works
- [ ] Mobile menu works on small screens
- [ ] All forms submit without errors