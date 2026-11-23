# Replit-to-GitHub Sync Tool

## Overview

A productivity tool that enables users to sync their Replit projects to GitHub repositories. The application provides a dashboard interface for managing project synchronization, viewing sync history, and configuring API tokens for both Replit and GitHub integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with React plugin

The frontend follows a page-based structure with reusable components. The main dashboard (`home.tsx`) contains three navigation sections: Projects, Settings, and History. Components are organized into:
- `/components/ui/` - Reusable shadcn/ui components
- `/components/` - Feature-specific components (settings panel, sync progress modal)
- `/pages/` - Route-level page components

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful JSON API with `/api/` prefix
- **Storage**: In-memory storage (MemStorage class) with interface abstraction for future database integration
- **Schema Validation**: Zod for runtime type validation
- **Build**: esbuild for production bundling with selective dependency bundling

Key API endpoints:
- `GET/POST /api/config` - Manage Replit/GitHub tokens and connection status
- `GET /api/projects` - Fetch Replit projects
- `POST /api/sync` - Trigger project synchronization
- `GET /api/sync-history` - View sync operation history

### Data Storage
- Currently uses in-memory storage (`MemStorage` class in `server/storage.ts`)
- Schema defined with Zod in `shared/schema.ts`
- Drizzle ORM configured for PostgreSQL migration when database is provisioned
- Storage interface (`IStorage`) allows swapping implementations

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components
    pages/        # Route pages
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Data storage layer
shared/           # Shared types and schemas
  schema.ts       # Zod schemas
```

## External Dependencies

### Third-Party Services
- **Replit API**: Requires user-provided API token for fetching projects
- **GitHub API**: Requires personal access token and username for repository operations

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle ORM with drizzle-kit for migrations
- Currently optional - falls back to in-memory storage

### Key NPM Dependencies
- `@tanstack/react-query` - Server state management
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `express` / `express-session` - HTTP server framework
- `zod` - Runtime type validation
- Radix UI primitives - Accessible UI components
- `date-fns` - Date formatting utilities