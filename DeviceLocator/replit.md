# Device Security Platform - SecureTrack

## Overview

A comprehensive device security and tracking platform built with React, Express, and PostgreSQL. SecureTrack provides real-time device monitoring, advanced security incident management, and comprehensive theft reporting capabilities with extensive user controls over target devices.

## Project Status ✅

**Latest Completion:**
- ✅ All TypeScript type errors resolved (31 errors → 0 errors)
- ✅ Complete device control center with 9+ control options
- ✅ Tabbed interface for Security, Tracking, and Advanced controls
- ✅ Production build succeeds with zero errors
- ✅ Hot module replacement working
- ✅ GitHub integration configured with Octokit
- ✅ Design guidelines created for professional dark theme UI
- ✅ App deployed and running on port 5000

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **UI Library**: Shadcn/UI components with Radix UI primitives for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support (dark mode ready)
- **State Management**: TanStack React Query v5 for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation

### Backend Architecture
- **Framework**: Express.js with TypeScript for REST API development
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Session Management**: Express sessions with PostgreSQL session store
- **Authentication**: Replit Auth integration with OpenID Connect
- **API Structure**: RESTful endpoints organized by resource (devices, incidents, users)
- **GitHub Integration**: Octokit REST API for repository management

### Database Design
- **Core Tables**: 
  - Users table (mandatory for Replit Auth)
  - Sessions table (mandatory for Replit Auth)
  - Devices with type enumeration and status tracking
  - Device locations for GPS tracking history
  - Incidents for security event management
  - Activity logs for audit trails
  - Alerts for user notifications
- **Relationships**: Proper foreign key constraints linking users to their devices, incidents, and activities
- **Enums**: PostgreSQL enums for device types, statuses, and incident types

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Middleware-based route protection ensuring users can only access their own data
- **User Management**: Automatic user creation/updates from OAuth provider data

## Key Features

### Device Management
- CRUD operations for user devices with real-time status tracking
- Device type classification (smartphone, tablet, laptop, desktop)
- Device status monitoring (active, inactive, offline)

### Device Control Center (NEW)
Comprehensive multi-tabbed control interface with 9+ device management options:

**Security Tab:**
- 🔒 Lock Device - Instantly lock unauthorized access
- 🔓 Unlock Device - Remote device unlock
- 🔔 Sound Alarm - Trigger loud alarm for device location
- 🛡️ Lost Mode - Enable lost device protection

**Tracking Tab:**
- 📍 Locate Device - Get precise device location via GPS
- 📡 Enable GPS - Activate high-precision GPS tracking

**Advanced Tab:**
- 🔄 Factory Reset - Wipe all data and restore to factory settings
- ⚡ Shutdown - Remote device shutdown

**Emergency Action:**
- 🚨 Report Theft - Immediately alert authorities and mark as compromised

### Location Tracking
- Historical GPS coordinate storage and latest location queries
- Real-time location updates with timestamp tracking
- Location history timeline

### Incident Management
- Security incident creation, status updates, and resolution tracking
- Theft reporting with automatic authority notification
- Incident severity classification

### Emergency Actions
- Quick response capabilities for theft reporting and device security
- One-click access to critical device controls
- Confirmation dialogs for destructive actions

### Activity Logging
- Comprehensive audit trail for all user and system actions
- Timestamp tracking for regulatory compliance
- Action history for security review

### Alert System
- Notification management for security events and system updates
- Unread alert tracking in navigation
- Alert categorization by severity and type

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Authentication**: Replit Auth service for OAuth-based user authentication
- **GitHub Integration**: Octokit REST API for repository management
- **Development**: Replit platform integration with cartographer plugin

### UI Components & Libraries
- **Radix UI**: Complete set of unstyled, accessible UI primitives
- **Lucide Icons**: Modern icon library for consistent iconography (40+ icons for device controls)
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for creating variant-based component APIs

### Development Tools
- **Vite**: Fast development server and build tool with React plugin
- **ESBuild**: High-performance JavaScript bundler for production builds
- **TypeScript**: Static type checking with strict configuration
- **Tailwind CSS**: Utility-first CSS framework with PostCSS integration

### Data Validation & Forms
- **Zod**: Schema validation library with TypeScript integration
- **React Hook Form**: Performance-focused form library with resolver pattern
- **Drizzle-Zod**: Integration layer between Drizzle ORM and Zod schemas

## Design Theme

**SecureTrack Dark Enterprise Theme:**
- Professional security-focused dark interface
- Material Design 3 elevation principles
- Linear-inspired typography and restraint
- Command clarity with comprehensive device controls
- Tabbed interface for efficient feature discovery
- Color-coded action severity (red for destructive, yellow for warnings, green for safe)

## Deployment Status

- ✅ Development: Running successfully on port 5000
- ✅ Production Build: Zero errors, ready for deployment
- ⏳ GitHub Integration: Configured (Octokit setup complete)
- 🚀 Ready for Publishing: App meets all production requirements
