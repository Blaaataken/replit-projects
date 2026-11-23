# DigitalVault - Digital Marketplace

## Overview

DigitalVault is a full-stack digital marketplace application that enables users to sell and purchase digital products. Built with a modern tech stack including React, Express, and PostgreSQL, it provides a complete e-commerce solution with authentication, payment processing, and file management capabilities. The platform supports product creation, categorization, secure payments through Stripe, and digital file delivery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **UI Components**: Shadcn/ui component library with Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect for secure user management
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions
- **File Handling**: Multer middleware for multipart file uploads with local storage

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver for scalable data storage
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **Key Entities**: 
  - Users with Stripe integration fields
  - Products with category relationships and file attachments
  - Orders with detailed transaction tracking
  - Product files with secure access controls
  - Categories for product organization
  - Reviews and ratings system

### API Structure
- **RESTful Design**: Organized endpoints following REST conventions
- **Route Organization**: Centralized route registration with middleware integration
- **Error Handling**: Global error middleware for consistent error responses
- **Request Logging**: Comprehensive request/response logging for debugging
- **File Upload**: Dedicated endpoints for secure file upload and management

### Authentication & Security
- **OAuth Integration**: Replit Auth with OpenID Connect for secure authentication
- **Session Security**: HTTP-only cookies with secure session storage
- **Authorization**: Route-level authentication middleware protecting sensitive endpoints
- **User Management**: Complete user profile management with Stripe customer integration

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment solution including subscription management, customer handling, and secure payment processing
- **Integration**: Server-side Stripe API with client-side Stripe Elements for payment forms

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Replit Platform**: Integrated development and hosting environment with built-in authentication

### Third-Party Services
- **Replit Auth**: OpenID Connect authentication provider for seamless user management
- **Font Services**: Google Fonts integration for typography (Inter, Geist Mono, etc.)

### Development Dependencies
- **Build Tools**: Vite with React plugin, ESBuild for server bundling
- **Type Safety**: TypeScript with strict configuration across frontend and backend
- **Code Quality**: ESLint and Prettier integration through Replit environment
- **Development Experience**: Hot module replacement, runtime error overlay, and development banner