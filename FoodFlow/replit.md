# Restaurant Order Management System

## Overview

A multi-restaurant SaaS platform for order management built with React, Express, and PostgreSQL. The system provides real-time order tracking and management capabilities with manual restaurant onboarding, secure email/password authentication, and external API integration for automated order submission from systems like n8n.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 25, 2025)

✓ Converted to multi-restaurant SaaS platform with manual onboarding
✓ Replaced Replit OIDC with custom email/password authentication
✓ Simplified order schema (phone number + order summary text)
✓ Created dynamic restaurant-specific API endpoints (/api/orders/:restaurantId)
✓ Added test restaurant: quesada206 with login credentials
✓ Implemented real-time dashboard with status updates
✓ Fixed API endpoint to support both n8n and standard JSON formats
✓ Tested end-to-end workflow: authentication, dashboard, API integration
✓ Added automatic webhook trigger for completed orders
✓ Integrated n8n webhook automation for downstream order processing

## Test Credentials

- **Email**: quesada206@gmail.com
- **Password**: quesadaPOS123
- **Restaurant ID**: quesada206

## API Integration

**Endpoint**: `POST /api/orders/quesada206`

**Supported Formats**:
1. **n8n Format**: `{"+1234567890": "order details here"}`
2. **Standard Format**: `{"from_number": "+1234567890", "order_summary": "order details here"}`

**Response**: Returns created order object with ID and timestamps

## Webhook Automation

**Trigger**: Automatically fires when any order status is updated to "completed"
**Webhook URL**: `https://ahas1.app.n8n.cloud/webhook/4a35e868-5be4-4375-909a-2220f06ac5bc`
**Method**: GET request with query parameters
**Parameters**:
- `restaurant_id`: Restaurant identifier (e.g., "quesada206")
- `from_number`: Customer phone number (e.g., "+14378825555")  
- `order_id`: Unique order identifier
- `status`: Always "completed" for this trigger
- `summary`: Order details text

**Example**: `https://ahas1.app.n8n.cloud/webhook/...?restaurant_id=quesada206&from_number=%2B14378825555&order_id=abc123&status=completed&summary=Order+details`

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit OIDC integration with Passport.js
- **API Design**: RESTful endpoints with middleware-based error handling

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Type-safe schema definitions in `/shared/schema.ts`
- **Tables**: Users, restaurants, orders, and session storage

### Authentication System
- **Provider**: Replit OIDC for secure authentication
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Authorization**: Route-level protection with middleware
- **User Management**: Automatic user creation/updates on login

### Real-time Features
- **Polling**: Client-side polling for order updates (5-second intervals)
- **Live Indicators**: Visual feedback for real-time status
- **Optimistic Updates**: Immediate UI updates with server sync

### UI Components
- **Design System**: Consistent component library with variants
- **Responsive Design**: Mobile-first approach with breakpoint handling
- **Accessibility**: ARIA-compliant components from Radix UI
- **Theming**: CSS custom properties for light/dark mode support

## Data Flow

### Order Management Flow
1. Orders are fetched from the backend with restaurant filtering
2. Real-time updates via polling mechanism
3. Status changes trigger optimistic UI updates
4. Server validation ensures data consistency
5. Error handling with user feedback via toast notifications

### Authentication Flow
1. User initiates login via `/api/login` endpoint
2. Replit OIDC handles authentication process
3. User data is stored/updated in PostgreSQL
4. Session is established with secure cookies
5. Protected routes verify authentication status

### State Management
- **Server State**: TanStack Query for caching and synchronization
- **Local State**: React hooks for component-specific state
- **Error Boundaries**: Graceful error handling with fallbacks
- **Loading States**: Skeleton components and loading indicators

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with WebSocket support
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware
- **express-session**: Session management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and tooling
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized production assets to `/dist/public`
- **Backend**: esbuild bundles server code to `/dist/index.js`
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Authentication**: Requires Replit-specific environment variables
- **Sessions**: Requires `SESSION_SECRET` for secure session management

### Production Setup
- Node.js server serves both API endpoints and static frontend
- PostgreSQL database with proper connection pooling
- Session storage configured for production environment
- Error handling and logging for production monitoring

The application follows a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The architecture prioritizes developer experience with hot reloading, type safety, and modern tooling while maintaining production readiness with proper error handling and performance optimizations.