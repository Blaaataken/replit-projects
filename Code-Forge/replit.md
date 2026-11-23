# RepoGen AI - AI-Powered Repository Generator

## Overview
RepoGen AI is a web application that uses AI to automatically generate complete, production-ready code repositories for GitHub. Users describe their project and the AI creates a full repository structure with proper file organization, boilerplate code, documentation, and one-click deployment to GitHub.

## Current State
- **Status**: MVP Complete with User Authentication
- **Last Updated**: January 2026

## Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Tailwind CSS for styling
- Shadcn/ui component library
- Theme support (light/dark mode)

### Backend
- Express.js server
- PostgreSQL database (for auth sessions)
- In-memory storage for generated repos
- OpenAI integration for AI generation (via Replit AI Integrations)
- Replit Auth for user authentication

### Key Integrations
- **Replit Auth**: User authentication supporting GitHub, Google, email login
  - Sessions stored in PostgreSQL
  - Auto-managed by Replit
- **OpenAI AI Integration**: Uses Replit AI Integrations (no API key needed, billed to credits)
  - Model: gpt-5.1 for repository generation
  - Uses structured JSON output for reliable parsing
- **GitHub Connection**: OAuth-based GitHub access via Replit Connectors
  - Permissions: read:org, read:project, read:user, repo, user:email
  - Currently connected to the owner's account

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Shadcn components
│   │   │   ├── theme-provider.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   ├── header.tsx
│   │   │   ├── file-tree.tsx
│   │   │   └── code-preview.tsx
│   │   ├── pages/
│   │   │   ├── landing.tsx   # Homepage with hero, features
│   │   │   ├── generate.tsx  # Repository generator
│   │   │   └── not-found.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts   # Authentication hook
│   │   ├── lib/
│   │   │   └── auth-utils.ts # Auth utilities
│   │   └── App.tsx
├── server/
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # In-memory storage
│   ├── db.ts                 # PostgreSQL connection
│   ├── github.ts             # GitHub API client
│   └── replit_integrations/  # Auth and AI integration modules
├── shared/
│   ├── schema.ts             # Type definitions
│   └── models/
│       └── auth.ts           # Auth database schema
└── design_guidelines.md      # UI design specifications
```

## API Endpoints

### Authentication
- **GET /api/login** - Initiates Replit Auth login flow
- **GET /api/logout** - Logs out user
- **GET /api/auth/user** - Returns current authenticated user (401 if not logged in)

### GitHub
- **GET /api/github/user** - Returns connected GitHub user info

### Repository Generation
**POST /api/generate** - Generate a repository structure using AI
```typescript
Request: {
  projectName: string;
  projectDescription: string;
  language: "typescript" | "javascript" | "python" | "go" | "rust";
  framework?: string;
  features?: string[];
}
Response: {
  name: string;
  description: string;
  files: FileNode[];
  readme: string;
  suggestedFeatures?: string[];
}
```

**POST /api/github/create** - Create a new GitHub repository with generated files
```typescript
Request: {
  name: string;
  description?: string;
  isPrivate: boolean;
  files: FileNode[];
}
Response: GitHub repository object with html_url
```

## User Preferences
- Modern, developer-focused design (inspired by Linear, GitHub)
- Dark mode support
- JetBrains Mono for code, Inter for UI text
- Clean, minimal animations
- Trust-first approach with real examples

## Recent Changes
- Added Replit Auth for user authentication (GitHub, Google, email)
- Added PostgreSQL database for session storage
- Updated header with login/logout and user profile
- Initial MVP implementation
- Landing page with hero, features, stats sections
- Repository generator with form and file tree preview
- OpenAI integration for AI-powered generation
- GitHub integration for direct repository creation

## Monetization Options
To make money from this app, consider:
1. **Stripe Integration** - Add subscription plans or per-generation pricing
2. **PayPal Integration** - Accept payments for premium features
3. **Freemium Model** - Free tier with limited generations, paid tier with unlimited

## Multi-User GitHub Setup (Future Enhancement)
Currently, the GitHub connection uses the owner's Replit Connector. For users to push to their own GitHub accounts, you would need to:

1. **Register a GitHub OAuth App**:
   - Go to GitHub Settings > Developer Settings > OAuth Apps
   - Create a new OAuth App
   - Set callback URL to: `https://your-app.replit.app/api/github/callback`

2. **Store credentials as secrets**:
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET

3. **Implement OAuth flow**:
   - Add `/api/github/login` endpoint to initiate OAuth
   - Add `/api/github/callback` to handle the callback
   - Store user tokens securely in the database

This would allow each user to connect their own GitHub account and push repositories directly to their accounts.

## Payment System

### Monetization Model
1. **Free Trial**: 1 free repository generation for new users
2. **Pay-Per-Build**: $3 per generation via Stripe (Stripe Elements checkout)
3. **Pro Monthly**: $15/month unlimited generations via PayPal (one-time order with 30-day access)

### Payment Endpoints
- **GET /api/usage** - Get user's usage stats and remaining generations
- **GET /api/stripe/config** - Get Stripe publishable key
- **POST /api/stripe/create-payment-intent** - Create Stripe payment for pay-per-build
- **POST /api/stripe/confirm-payment** - Confirm payment and add generation credit
- **GET /paypal/setup** - Get PayPal client token
- **POST /paypal/order** - Create PayPal order
- **POST /paypal/order/:orderID/capture** - Capture PayPal order
- **POST /api/paypal/confirm-subscription** - Confirm PayPal payment (server-side verified)

### Payment Security
- **Stripe**: Uses Payment Intents with server-side confirmation
- **PayPal**: Server-side verification via `verifyPaypalOrder()` checks:
  - Order status is "COMPLETED"
  - Amount matches expected $15.00
  - Prevents duplicate order ID usage

### Database Tables
- **user_usage**: Tracks free/paid generations, subscription status
- **payments**: Payment history for Stripe/PayPal transactions
- **generations**: Log of all repository generations

### Known Limitations (Future Enhancements)
- PayPal uses one-time orders with 30-day access window (not true recurring subscriptions)
  - To upgrade: Use PayPal Subscriptions API with Plans + webhooks for renewal/cancelation
- GitHub uses owner's Replit Connector; multi-user needs GitHub OAuth App

## Development Notes
- Uses Replit AI Integrations - no need to manage API keys
- Replit Auth handles user login (GitHub, Google, email, etc.)
- PostgreSQL for auth sessions and payment tracking
- Stripe for pay-per-build (Stripe Elements checkout)
- PayPal for monthly access (server-verified one-time payments)
- Design follows design_guidelines.md specifications
