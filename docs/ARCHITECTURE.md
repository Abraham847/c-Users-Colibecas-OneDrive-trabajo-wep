# CloudHost Architecture

## Overview
CloudHost is a complete web hosting and domain management platform built with modern technologies.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (access + refresh tokens)
- **Real-time**: Socket.IO (WebSocket)
- **Payments**: Stripe + PayPal
- **AI**: OpenAI GPT-4
- **Infrastructure**: Docker, Nginx

## Project Structure
```
cloudhost/
├── backend/           # Express API
│   ├── src/
│   │   ├── config/    # App configuration
│   │   ├── middleware/ # Auth, validation, error handling
│   │   ├── models/    # MongoDB schemas
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   ├── ai/        # AI integration
│   │   ├── websocket/ # WebSocket handlers
│   │   └── utils/     # Helpers
│   └── tests/         # Test files
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client
│   │   ├── store/      # State management (Zustand)
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utilities
│   └── public/         # Static assets
├── shared/            # Shared types
├── docs/              # Documentation
└── docker-compose.yml # Container orchestration
```

## Key Features
1. **Authentication**: JWT-based with refresh tokens, password reset, email verification
2. **Domains**: Search, register, manage DNS, SSL, WHOIS privacy
3. **Hosting**: Shared, VPS, dedicated plans with resource monitoring
4. **Payments**: Stripe integration, PayPal, subscription management
5. **AI Builder**: Generate websites from natural language descriptions
6. **DNS Editor**: Full DNS zone management
7. **File Manager**: Upload, edit, delete server files
8. **Email**: Business email accounts management
9. **Deployments**: Auto-deploy from GitHub
10. **Admin Panel**: User management, system stats, revenue tracking

## API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/domains/*` - Domain management
- `/api/hosting/*` - Hosting plans
- `/api/payments/*` - Payment processing
- `/api/dns/*` - DNS management
- `/api/emails/*` - Email accounts
- `/api/files/*` - File manager
- `/api/ai/*` - AI features
- `/api/ssl/*` - SSL certificates
- `/api/deployments/*` - Deployments
- `/api/support/*` - Support tickets
- `/api/admin/*` - Admin panel
- `/api/webhooks/*` - Webhook receivers

## Environment Variables
See `.env.example` for all required configuration.
