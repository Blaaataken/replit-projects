# Nexus AI - Multi-Modal Learning Assistant

## Overview

Nexus AI is a multi-modal AI chat assistant that supports text, voice, and video input capabilities. The application provides a ChatGPT/Claude-inspired interface with conversation history, knowledge persistence, and real-time streaming responses. Built as a full-stack TypeScript application with React frontend and Express backend, it integrates with Google's Gemini AI models through Replit's AI Integrations service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Design System**: Inter font for UI, JetBrains Mono for code blocks, conversation-first design approach

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Streaming**: Server-Sent Events (SSE) for real-time AI response streaming
- **Build Process**: Custom esbuild script bundles server for production with Vite handling client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Models**: gemini-2.5-flash (fast), gemini-2.5-pro (reasoning), gemini-2.5-flash-image (image generation)
- **Configuration**: Uses `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables
- **Features**: Text generation, image analysis, voice transcription support, streaming responses

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory are imported by both client and server
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **Modular Integrations**: Replit integrations organized in `server/replit_integrations/` with separate modules for chat, image, and batch processing

## External Dependencies

### Database
- **PostgreSQL**: Primary data store for users, conversations, messages, and knowledge entries
- **Connection**: Managed via `pg` Pool with connection string from `DATABASE_URL`

### AI Services
- **Replit AI Integrations**: Provides Gemini API access without requiring personal API keys
- **Environment Variables Required**:
  - `AI_INTEGRATIONS_GEMINI_API_KEY`: API key for Gemini access
  - `AI_INTEGRATIONS_GEMINI_BASE_URL`: Base URL for the AI service endpoint

### Third-Party Libraries
- **@google/genai**: Official Google GenAI SDK for Gemini model interactions
- **drizzle-orm / drizzle-kit**: Database ORM and migration tooling
- **Radix UI**: Accessible component primitives (dialog, popover, select, etc.)
- **TanStack Query**: Async state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Development server and build tool with React plugin

### Development Tools
- **Replit Vite Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **TypeScript**: Strict mode enabled with bundler module resolution