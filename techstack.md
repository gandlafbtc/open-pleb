# OpenPleb Technology Stack Guide

This document provides an overview of the technology stack used in the OpenPleb project. It is designed to help new contributors understand the technologies they should focus on learning to effectively contribute to the project.

## Overview

OpenPleb is a platform for matching users who want to pay banking QR codes with Bitcoin (makers), and earners who want to earn Bitcoin for paying these offers (takers). The platform facilitates these transactions through a bond system that ensures incentives are aligned for both parties.

The project is structured as a monorepo with multiple packages, each serving a specific purpose in the overall architecture.

## Core Architecture

- **Repository Pattern**: Monorepo structure with multiple packages in the `packages/` directory
- **Languages**: TypeScript is used throughout the entire project
- **Database**: PostgreSQL with Drizzle ORM for database operations
- **Containerization**: Docker and Docker Compose for development and deployment

## Backend Technologies

- **Runtime**: [Bun.js](https://bun.sh/) - A fast JavaScript runtime and package manager
- **API Framework**: [Elysia.js](https://elysiajs.com/) - A fast and type-safe HTTP framework for Bun
- **API Extensions**:
  - `@elysiajs/cors` - CORS support
  - `@elysiajs/cookie` - Cookie management
  - `@elysiajs/jwt` - JWT authentication
  - `@elysiajs/swagger` - API documentation
  - `@elysiajs/cron` - Scheduled tasks
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Lightweight TypeScript ORM
- **Bitcoin/Lightning**: 
  - `@cashu/cashu-ts` - Cashu protocol implementation for token management
  - `@lightningpolar/lnd-api` - Lightning Network Daemon API integration
  - `light-bolt11-decoder` - Lightning invoice decoder
- **Security**:
  - `@node-rs/argon2` - Password hashing
  - Various cryptographic libraries for security operations
- **Notification Services**:
  - `@negrel/webpush` - Web Push notifications
  - `discord.js` - Discord bot integration

## Frontend Technologies

- **Framework**: [SvelteKit](https://kit.svelte.dev/) - A framework for building web applications with Svelte
- **Adapter**: `@sveltejs/adapter-node` - For server-side rendering
- **UI Components**:
  - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Bits UI](https://www.bits-ui.com/) - Accessible component primitives
  - [Lucide Icons](https://lucide.dev/) - Consistent icon set
  - `svelte-sonner` - Toast notifications
  - `tailwindcss-animate` - Animations
- **State Management**:
  - Svelte stores - For persistent and local state management
  - `idb` - IndexedDB wrapper for client-side storage
- **Special Features**:
  - `qr-scanner` - QR code scanning capability
  - `svelte-file-dropzone` - File upload functionality
  - `@inlang/paraglide-sveltekit` - Internationalization
- **Bitcoin/Lightning**:
  - `@cashu/cashu-ts` - Cashu protocol for e-cash tokens
  - `@gandlaf21/cashu-wallet-engine` - Wallet implementation

## Admin Frontend
Similar to the main frontend but with additional administration-specific components:
- `@tanstack/table-core` - Advanced table functionality
- `svelte-range-slider-pips` - Range slider components

## Umbrel App Integration

A separate package for integrating with Umbrel:
- Simplified SvelteKit application
- [DaisyUI](https://daisyui.com/) - Component library for Tailwind CSS
- Tailwind CSS v4

## Common Package

Shared code and utilities used across multiple packages:
- Database schema definitions
- Type definitions
- Shared utilities for:
  - Error handling
  - Type conversions
  - LNURL handling

## Database Schema

The application uses a relational database with tables for:
- Offers - Core data structure for payment offers
- Claims - Records of who claimed which offers
- Receipts - Payment receipts uploaded by users
- Proofs - Cryptographic proofs for transactions
- Tokens - Various tokens used in the bond system
- Users - User account information
- Settings - Application settings
- Fiat Providers - Information about supported fiat payment services

## Development Environment

To contribute to OpenPleb, you'll need:
- Bun.js
- Docker and Docker Compose
- PostgreSQL knowledge
- Node.js/TypeScript experience
- Understanding of Bitcoin and Lightning Network concepts

## Key Concepts to Learn

1. **Svelte/SvelteKit**: [Understanding component-based architecture and SvelteKit's routing system](https://kit.svelte.dev/docs/introduction)
2. **Elysia.js**: [API routing and middleware patterns](https://elysiajs.com/quick-start.html)
3. **Drizzle ORM**: [Database schema definition and query building](https://orm.drizzle.team/docs/overview)
4. **Cashu Protocol**: [E-cash token concepts and operations](https://github.com/cashubtc/cashu)
5. **Lightning Network**: Understand Lightning network payment flow
6. **TypeScript**: [Strong typing and interfaces throughout the codebase](https://www.typescriptlang.org/docs/)
7. **TailwindCSS**: [Utility-first CSS approach](https://tailwindcss.com/docs/utility-first) 
8. **ShadCN**: [UI component library based on TailwindCSS](https://ui.shadcn.com/) 
9. **Bun.js**: [Modern JavaScript runtime features](https://bun.sh/docs)

## Deployment Architecture

The application is designed to be deployed using Docker containers with the following services:
- Backend API server
- Frontend web application
- Admin frontend
- PostgreSQL database
- (Optional) Umbrel app integration

Each component has its own Dockerfile for building containers, and the services are orchestrated using Docker Compose.

## Recommended Learning Path for New Contributors

1. Start with [TypeScript fundamentals](https://www.typescriptlang.org/docs/handbook/intro.html) if not already familiar
2. Learn [Svelte basics](https://svelte.dev/tutorial/basics) and then [SvelteKit](https://kit.svelte.dev/docs/introduction) for routing and layout
3. Understand [TailwindCSS](https://tailwindcss.com/docs/installation) for styling components 
4. Familiarize yourself with [Drizzle ORM](https://orm.drizzle.team/docs/overview) for database operations
5. Study [Cashu](https://docs.cashu.space/) for e-cash tokens
6. Explore [Elysia.js](https://elysiajs.com/introduction.html) for API development patterns
7. Get comfortable with [Bun.js](https://bun.sh/docs/installation) environment and tooling

With this foundation, you'll be well-equipped to contribute to different aspects of the OpenPleb project.
