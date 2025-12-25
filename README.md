# Trackify - ApniSec Security Issue Management

A full-stack Next.js 15+ application with custom JWT authentication, rate limiting, email integration, and SEO optimization. Built with a strict OOP backend architecture.

## Tech Stack

- **Frontend**: Next.js 15+, React 19+, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (OOP architecture)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Custom JWT authentication (bcrypt + jsonwebtoken)
- **Email**: Resend
- **Rate Limiting**: Custom implementation (in-memory)

## Features

- ✅ Custom JWT Authentication (Register, Login, Logout)
- ✅ Protected Routes with Middleware
- ✅ Issue Management (CRUD with Cloud Security, VAPT, Red Team types)
- ✅ User Profile Management
- ✅ Rate Limiting (100 requests/15 min)
- ✅ Email Notifications (Welcome, Issue Created, Profile Updated)
- ✅ SEO Optimized Landing Page
- ✅ Responsive Design
- ✅ OOP Backend Architecture (Handlers, Services, Repositories, Validators)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Resend account for emails

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Resend
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)

### User Profile
- `GET /api/users/profile` - Get profile (protected)
- `PUT /api/users/profile` - Update profile (protected)

### Issues
- `GET /api/issues` - List issues (protected, filter: `?type=CLOUD_SECURITY`)
- `POST /api/issues` - Create issue (protected)
- `GET /api/issues/[id]` - Get issue (protected)
- `PUT /api/issues/[id]` - Update issue (protected)
- `DELETE /api/issues/[id]` - Delete issue (protected)

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/            # Auth endpoints
│   │   ├── issues/          # Issue CRUD
│   │   └── users/           # User profile
│   ├── dashboard/           # Protected dashboard
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── profile/             # Profile page
│   └── page.tsx             # Landing page
├── lib/
│   ├── core/                # Base classes
│   │   ├── BaseHandler.ts
│   │   ├── BaseValidator.ts
│   │   └── RateLimiter.ts
│   ├── repositories/        # Data access
│   ├── services/            # Business logic
│   └── validators/          # Input validation
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts            # Route protection
```

## OOP Architecture

The backend follows strict OOP principles:

- **Handlers**: Process HTTP requests, validate input, return responses
- **Services**: Business logic, authentication, email sending
- **Repositories**: Database operations (CRUD)
- **Validators**: Input validation using Zod schemas

## License

MIT
