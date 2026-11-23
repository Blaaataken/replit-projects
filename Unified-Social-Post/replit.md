# UnifyPost - Unified Social Media Posting Platform

## Overview
UnifyPost is a unified social media posting application that allows users to manage all their social media accounts from one place. Write once, post everywhere - to Twitter/X, Facebook, LinkedIn, Instagram, and Threads.

## Current State
The MVP is complete with the following features:
- Dashboard with statistics overview
- Connect and manage social media accounts
- Compose and publish posts to multiple platforms simultaneously
- Post history with filtering by status
- Light/dark theme support
- Settings page for notifications and API configuration

## Tech Stack
- **Frontend**: React with TypeScript, Vite, TailwindCSS, Shadcn UI
- **Backend**: Express.js with TypeScript
- **Data**: In-memory storage (ready for database upgrade)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

## Supported Platforms
- Twitter/X (280 char limit)
- Facebook (63,206 char limit)
- LinkedIn (3,000 char limit)
- Instagram (2,200 char limit)
- Threads (500 char limit)

## API Endpoints
- GET /api/accounts - Get all connected accounts
- POST /api/accounts - Connect a new account
- DELETE /api/accounts/:id - Disconnect an account
- GET /api/posts - Get all posts
- POST /api/posts - Create a new post
- DELETE /api/posts/:id - Delete a post

## Future Enhancements
- Real API integration with social platforms (requires developer API keys)
- PostgreSQL database for persistence
- User authentication
- Post scheduling functionality
- Media upload support
