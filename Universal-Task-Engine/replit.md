# Nexus AI - Intelligent Task Assistant

## Overview

Nexus AI is a conversational AI assistant application built with a React frontend and Express backend. The application enables users to have multi-turn conversations with an AI assistant powered by OpenAI's API through Replit's AI Integrations. Users can create, manage, and delete conversation threads while receiving streaming AI responses.

The core functionality includes:
- Real-time AI chat with streaming responses
- Conversation history management (create, view, delete)
- Dark/light theme support
- Voice chat capabilities (audio recording, transcription, text-to-speech)
- Image generation support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable components in `client/src/components/`
- UI primitives in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`
- Shared utilities in `client/src/lib/`

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: RESTful API with SSE (Server-Sent Events) for streaming responses
- **AI Integration**: OpenAI API via Replit AI Integrations (environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`)

Key backend modules in `server/replit_integrations/`:
- `chat/` - Text-based conversation handling with streaming
- `audio/` - Voice recording, transcription, and text-to-speech
- `image/` - AI image generation
- `batch/` - Rate-limited batch processing utilities

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Storage**: In-memory storage (`server/storage.ts`) with database schema ready for PostgreSQL migration
- **Database Push**: Use `npm run db:push` to sync schema with database

Database schema includes:
- `users` - User accounts with username/password
- `conversations` - Chat conversation threads
- `messages` - Individual messages within conversations (user/assistant roles)

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle database schema and Zod validation schemas
- `models/` - Additional data models

## External Dependencies

### AI Services
- **OpenAI API**: Used for chat completions, audio transcription, text-to-speech, and image generation
- **Configuration**: Requires `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migration and schema management

### Key NPM Packages
- **Frontend**: React, TanStack Query, Radix UI, Tailwind CSS, Wouter, date-fns
- **Backend**: Express, Drizzle ORM, OpenAI SDK, pg (PostgreSQL client)
- **Build**: Vite, esbuild, TypeScript

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- **Session Storage**: connect-pg-simple for PostgreSQL session storage (optional)