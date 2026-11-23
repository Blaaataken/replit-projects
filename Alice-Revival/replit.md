# Alice - AI Personal Assistant

## Overview
Alice is a modern web-based AI personal assistant inspired by a 1981 concept. She is an intuitive assistant that learns user patterns, anticipates needs, and helps achieve goals.

## Project Architecture

### Stack
- **Frontend**: React with TypeScript, TailwindCSS, Shadcn/UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-5 via Replit AI Integrations (no API key required, billed to credits)
- **Auth**: Replit Auth

### Key Features
1. **Conversational AI** - Natural language chat with Alice who remembers context
2. **Goal Tracking** - Set, track, and achieve personal goals with progress visualization
3. **Proactive Suggestions** - Alice provides personalized recommendations
4. **Voice Input** - Speak to Alice using web speech recognition
5. **Dark/Light Mode** - Theme toggle with system preference detection
6. **Responsive Design** - Works on all devices

### Project Structure
```
client/
  src/
    components/     # Reusable UI components
    hooks/          # Custom React hooks
    lib/            # Utility functions and API client
    pages/          # Page components (landing, chat, goals, insights)
server/
  routes.ts         # API endpoints
  storage.ts        # Database operations
  replitAuth.ts     # Authentication setup
  db.ts             # Database connection
shared/
  schema.ts         # Drizzle ORM schema with all data models
```

### Database Schema
- `users` - User accounts (via Replit Auth)
- `conversations` - Chat sessions
- `messages` - Individual chat messages
- `goals` - User goals with progress tracking
- `user_preferences` - Communication style, settings
- `learned_patterns` - Patterns Alice learns about users
- `suggestions` - Proactive recommendations

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database

## User Preferences
- Design: Clean, modern aesthetic with Inter font
- Communication: Alice uses warm, supportive tone
- Theme: Supports dark and light modes

## Recent Changes
- Initial MVP implementation with full chat, goals, and insights features
- Integrated OpenAI GPT-5 for Alice's intelligence
- Set up Replit Auth for user authentication
- Created responsive sidebar navigation
