# SHAWNSWORKS Cryptocurrency Landing Page

## Overview

This is a modern, full-stack cryptocurrency landing page for SHAWNSWORKS token built with React, TypeScript, Express.js, and Drizzle ORM. The application features a responsive design with dark theme, real-time metrics, contact form functionality, and comprehensive UI components using shadcn/ui.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **Styling**: Tailwind CSS with custom crypto-themed design system
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API**: REST API with structured error handling and logging middleware
- **Development**: Hot reloading with Vite SSR in development mode

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL with Neon serverless driver
- **Migrations**: Drizzle Kit for schema management
- **Storage**: DatabaseStorage implementation with full PostgreSQL persistence

## Key Components

### Frontend Components
- **Navigation**: Fixed header with smooth scrolling navigation
- **Hero Section**: Animated landing area with gradient backgrounds and feature highlights
- **Dashboard**: Live metrics display with real-time token data
- **Features**: Interactive feature cards showcasing platform capabilities
- **Tokenomics**: Visual representation of token distribution and utility
- **Contact Form**: Form handling with validation and submission
- **AI Calculator**: Investment projection calculator (UI implemented)

### Backend Components
- **Express Server**: Main application server with middleware setup
- **Route Handlers**: RESTful endpoints for contacts and token metrics
- **Storage Layer**: Abstracted storage interface supporting multiple implementations
- **Validation**: Zod schema validation for API inputs

### Database Schema
- **Users Table**: User management with username/password authentication
- **Contacts Table**: Contact form submissions with detailed fields
- **Token Metrics Table**: Real-time cryptocurrency metrics and data

## Data Flow

1. **Client Request**: Frontend makes API requests using TanStack Query
2. **Server Processing**: Express middleware handles routing, validation, and logging
3. **Data Layer**: Storage interface abstracts database operations
4. **Response**: Structured JSON responses with error handling
5. **UI Updates**: React Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework
- **zod**: Schema validation library

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- Memory-based storage for rapid prototyping
- Error overlay and debugging tools
- Replit integration with live preview

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Environment**: Production mode with database persistence

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- Build artifacts separated for efficient deployment

## Changelog

```
Changelog:
- July 07, 2025. Initial setup with full-stack SHAWNSWORKS cryptocurrency website
- July 07, 2025. Added PostgreSQL database with Drizzle ORM integration
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```