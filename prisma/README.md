# Prisma Setup for 911 Scheduling Application

This directory contains the Prisma configuration for the 911 scheduling application.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with your database connection:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

### 2. Generate Prisma Client

After setting up your environment variables, generate the Prisma client:

```bash
npm run prisma:generate
```

### 3. Database Operations

- **Push schema to database**: `npm run prisma:push`
- **Create and apply migrations**: `npm run prisma:migrate`
- **Open Prisma Studio**: `npm run prisma:studio`
- **Format schema**: `npm run prisma:format`
- **Reset database**: `npm run db:reset`

### 4. Using Prisma in Your Code

Import the Prisma client in your files:

```typescript
import { prisma } from '@/lib/prisma'

// Example query
const users = await prisma.profile.findMany({
  include: {
    userRoles: {
      include: {
        role: true
      }
    }
  }
})
```

## Schema Overview

The schema includes the following main models:

- **Profile**: User profiles with roles and preferences
- **Role**: User roles (dispatcher, supervisor, admin)
- **Shift**: Shift templates with time definitions
- **Schedule**: 4-month scheduling blocks
- **AssignedShift**: Individual shift assignments
- **TimeOffRequest**: Employee time-off requests
- **ShiftSwap**: Shift swap requests between employees
- **ChatMessage**: Internal chat system
- **Notification**: User notifications
- **AuditLog**: System audit trail

## Notes

- The schema is designed to work with your existing Supabase PostgreSQL database
- All table names use snake_case to match your existing database
- Foreign key relationships are properly defined with cascade delete rules
- Enum types match your existing database enums 