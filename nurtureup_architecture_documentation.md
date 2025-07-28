# NurtureUp - Project Architecture Documentation

## Overview

NurtureUp is a family task management and gamification platform built with Next.js that helps parents assign tasks (called "quests") to children while providing a fun, game-like experience for kids to complete these tasks and earn rewards.

## Technology Stack

### Core Framework
- **Next.js 15.4.3** - Full-stack React framework with App Router
- **React 19.1.0** - Frontend UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Database & ORM
- **SQLite** - Local database for development
- **Prisma 6.12.0** - Database ORM and schema management
- **Prisma Client** - Type-safe database queries

### Authentication
- **NextAuth.js 4.24.11** - Authentication framework
- **Prisma Adapter** - Database session storage
- **bcryptjs** - Password hashing
- **JWT Strategy** - Session management

### Real-time Features
- **Pusher** - Real-time WebSocket communication
- **pusher-js** - Client-side WebSocket handling

### UI & Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **React Hot Toast** - Toast notifications

### Additional Libraries
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Cloudinary** - Image upload and management
- **Axios** - HTTP client
- **date-fns** - Date utility library

## Project Structure

```
nurtureup/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Database schema definition
│   ├── migrations/           # Database migration files
│   └── seed.ts              # Database seeding script
├── public/                   # Static assets
├── scripts/                  # Utility scripts
│   ├── clear-badges.ts      # Badge management scripts
│   └── init-badges.ts
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API route handlers
│   │   ├── child/           # Child-specific pages
│   │   ├── parent/          # Parent-specific pages
│   │   ├── login/           # Authentication pages
│   │   └── register/
│   ├── components/          # React components
│   │   ├── child/           # Child-specific components
│   │   ├── parent/          # Parent-specific components
│   │   ├── providers/       # Context providers
│   │   ├── shared/          # Shared components
│   │   └── ui/              # Base UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries and services
│   ├── store/               # State management
│   ├── styles/              # Additional styles
│   └── types/               # TypeScript type definitions
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.ts           # Next.js configuration
└── package.json            # Dependencies and scripts
```

## Database Schema Architecture

### Core Entities

#### User Management
- **User**: Base user accounts with role-based access (PARENT, CHILD, CAREGIVER)
- **Family**: Family units that group users together
- **Parent**: Parent-specific profile data
- **Child**: Child-specific profile with gamification metrics

#### Task System
- **Task**: Tasks/chores assigned to children with difficulty and rewards
- **TaskCompletion**: Records of completed tasks with approval workflow
- **RecurringTaskService**: Handles recurring task generation

#### Gamification
- **Badge**: Achievement system with criteria-based unlocking
- **BadgeEarned**: Junction table for user badge achievements
- **VirtualPet**: Pet system for children with care mechanics
- **LearningScore**: Educational progress tracking

#### Rewards & Economy
- **Reward**: Marketplace items children can purchase
- **RewardPurchase**: Purchase records with redemption tracking
- **FamilySettings**: Family-wide configuration including star-to-coin ratios

#### Social Features
- **Milestone**: Family timeline and memory system
- **FamilySettings**: Configuration for family features and preferences

### Key Relationships
- Users belong to Families (many-to-one)
- Children are assigned Tasks (one-to-many)
- TaskCompletions require Parent approval
- Children earn Badges through various criteria
- Rewards can be purchased with earned coins
- VirtualPets are owned by individual Children

## API Architecture

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Task Management
- `GET /api/tasks` - Fetch family tasks
- `POST /api/tasks` - Create new tasks
- `POST /api/tasks/[taskId]/complete` - Mark task as completed
- `POST /api/tasks/completions/[completionId]/approve` - Approve task completion
- `POST /api/tasks/recurring/generate` - Generate recurring tasks

### Child-Specific APIs
- `GET /api/child` - Child profile data
- `GET /api/child/quests` - Available quests for child
- `GET /api/child/rewards` - Available rewards
- `POST /api/child/rewards/[rewardId]/purchase` - Purchase reward
- `GET /api/child/wallet` - Wallet/currency information
- `POST /api/child/arcade/complete` - Complete learning activities
- Pet management: `/api/child/pet/{feed,play,route}`
- Screen time: `/api/child/screen-time/{start,end}`

### Parent-Specific APIs
- `GET /api/parent/notifications` - Parent notifications
- `GET /api/parent/pending-approvals` - Tasks awaiting approval
- `GET /api/parent/progress` - Children progress reports
- `GET/POST /api/parent/rewards` - Reward marketplace management
- `POST /api/parent/reward-purchases/[purchaseId]/redeem` - Redeem purchased rewards

### Family & Settings
- `GET /api/children` - List family children
- `GET/POST /api/family/settings` - Family configuration
- `GET/POST /api/milestones` - Family timeline management

### Admin Features
- `POST /api/admin/init-badges` - Initialize badge system

## Component Architecture

### Layout Structure
- **Root Layout** (`app/layout.tsx`): Wraps entire app with providers
- **Parent Layout** (`app/parent/layout.tsx`): Parent-specific navigation and layout
- **Child Layout** (`app/child/layout.tsx`): Child-specific navigation and layout

### Provider System
- **AuthProvider**: Session management using NextAuth
- **NotificationProvider**: Real-time notification handling via Pusher
- **CelebrationProvider**: Achievement celebrations and animations

### Component Organization

#### Parent Components (`components/parent/`)
- **TaskList**: Display and manage family tasks
- **TaskForge**: Create new tasks with recurring options
- **DashboardWidgets**: Parent dashboard overview
- **PendingApprovalsSummary**: Task approval workflow
- **RewardMarketplace**: Manage family reward store
- **ChildrenManager**: Manage child profiles
- **NotificationList**: Parent notification center

#### Child Components (`components/child/`)
- **ChildNavigation**: Bottom navigation for child interface
- **QuestList**: Display available quests/tasks
- **VirtualPet**: Pet interaction and care
- **LearningArcade**: Educational mini-games
- **WalletDisplay**: Currency and progress display
- **RewardMarketplace**: Browse and purchase rewards

#### Shared Components (`components/shared/`)
- **BadgeCelebration**: Achievement celebration animations
- **ConfettiAnimation**: Success animations
- **NotificationBell**: Real-time notification display
- **PhotoUpload**: Image upload with Cloudinary integration

#### UI Components (`components/ui/`)
- Base components built on Radix UI primitives
- Consistent design system with Tailwind CSS
- Accessible and reusable interface elements

## Authentication & Authorization

### Authentication Flow
1. **Login Process**: Credentials validated against hashed passwords in database
2. **Session Management**: JWT tokens with NextAuth.js
3. **Role-Based Access**: PARENT, CHILD, CAREGIVER roles determine interface access
4. **Family Context**: All operations scoped to user's family

### Authorization Patterns
- API routes check session and family membership
- Role-based component rendering
- Protected routes with automatic redirection
- Family-scoped data access controls

## Real-time Features

### Pusher Integration
- **User Channels**: Personal notifications (`user-{userId}`)
- **Family Channels**: Family-wide broadcasts (`family-{familyId}`)
- **Role Channels**: Role-specific messages (`family-{familyId}-{role}`)

### Notification Types
- `task_completed` - Child completes a task
- `task_approved` - Parent approves task completion
- `new_task` - New quest available
- `badge_earned` - Achievement unlocked
- `reward_purchased` - Reward purchased
- `milestone_added` - Family milestone created

### Real-time Updates
- Task completion notifications
- Badge celebrations
- Reward purchases
- Family timeline updates
- Progress synchronization

## State Management

### Client-Side State
- **React Hooks**: Local component state
- **Custom Hooks**: `useAuth`, `useCelebration`, `useNotifications`
- **Context Providers**: Global state for auth, notifications, celebrations
- **Zustand**: Lightweight state management for complex data

### Data Fetching
- **TanStack Query**: Server state management and caching
- **SWR-like patterns**: Automatic data synchronization
- **Real-time updates**: Pusher integration for live data

## Styling & Design System

### Theme Configuration
- **Parent Palette**: Professional and calming colors
  - Slate Gray (`#5C6B73`)
  - Sage Green (`#8A9A5B`)
  - Off White (`#F7F7F7`)

- **Child Palette**: Playful and vibrant colors
  - Soft Coral (`#FFDAB9`)
  - Sunny Yellow (`#FFFACD`)
  - Mint Green (`#98FF98`)
  - Sky Blue (`#B0E0E6`)

### Typography
- **Sans Font**: Inter for general UI
- **Display Font**: Nunito Sans for headings
- **Child Font**: Baloo 2 for child-friendly interface

### Animation System
- Custom keyframes for confetti, celebrations, and micro-interactions
- Framer Motion for complex animations
- CSS animations for performance-critical effects

## Gamification System

### Points & Currency
- **Stars**: Primary reward currency for task completion
- **Coins**: Purchased with stars (configurable ratio)
- **XP**: Experience points for leveling up
- **Streaks**: Consecutive day completion tracking

### Achievement System
- **Badges**: Unlocked through various criteria
- **Levels**: Character progression system
- **Milestones**: Family achievement tracking

### Virtual Pet
- **Pet Care**: Feeding and playing mechanics
- **Mood System**: Pet happiness based on interaction
- **Customization**: Accessories and appearance options

### Learning Integration
- **Arcade Games**: Educational mini-games
- **Learning Scores**: Subject-based progress tracking
- **Screen Time**: Managed and trackable usage

## File Upload & Media

### Cloudinary Integration
- **Image Storage**: Cloud-based asset management
- **Automatic Optimization**: Responsive image delivery
- **Upload Components**: Drag-and-drop interfaces
- **Security**: Secure upload URLs and transformations

### Media Types
- **Profile Avatars**: User profile pictures
- **Task Proof**: Photo evidence for task completion
- **Milestone Photos**: Family memory documentation
- **Reward Images**: Marketplace item visuals

## Security Considerations

### Data Protection
- **Password Hashing**: bcryptjs for secure password storage
- **Session Security**: JWT tokens with secure configuration
- **Input Validation**: Zod schemas for all API endpoints
- **SQL Injection Prevention**: Prisma ORM parameterized queries

### Access Control
- **Family Scoping**: All data access limited to user's family
- **Role-Based Permissions**: Different capabilities for parents vs children
- **API Authentication**: Session validation on all protected endpoints
- **CORS Configuration**: Proper cross-origin request handling

## Deployment & Configuration

### Environment Variables
- Database connection strings
- Pusher configuration
- Cloudinary API keys
- NextAuth secrets and URLs

### Production Considerations
- Database migration strategy
- Asset optimization
- Real-time scaling with Pusher
- Image optimization with Cloudinary CDN

## Development Workflow

### Scripts Available
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint code quality checks

### Database Management
- Prisma migrations for schema changes
- Seed scripts for initial data setup
- Badge initialization scripts

### Testing & Quality
- ESLint for code quality
- TypeScript for type safety
- Husky for git hooks
- Lint-staged for pre-commit validation

## Key Design Patterns

### Component Patterns
- **Composition over Inheritance**: Flexible component design
- **Provider Pattern**: Context-based state sharing
- **Custom Hooks**: Reusable stateful logic
- **Compound Components**: Complex UI component organization

### API Patterns
- **RESTful Design**: Standard HTTP methods and status codes
- **Error Handling**: Consistent error response format
- **Validation**: Input validation at API boundaries
- **Authorization**: Session-based access control

### Data Patterns
- **Family-Scoped Queries**: All data operations within family context
- **Optimistic Updates**: UI updates before server confirmation
- **Real-time Synchronization**: Pusher-based live data updates
- **Caching Strategy**: Client-side caching with TanStack Query

This architecture provides a scalable, maintainable foundation for the NurtureUp family task management platform, with clear separation of concerns and modern web development best practices.