# Jersey City OS

A CitiStat performance management platform for Jersey City government — built with Next.js 15, PostgreSQL, and Auth.js.

## What it does

JCOS gives city leadership a real-time view of departmental performance across five modules:

| Module | Description |
|---|---|
| **Executive Scorecard** | City-wide KPI dashboard with status indicators and sparkline trends |
| **Department Dashboards** | Per-department metrics, trend charts, and metric data entry |
| **Issue Tracker** | Log, prioritize, escalate, and resolve operational issues |
| **Action Management** | Corrective actions tied to issues with status tracking |
| **Performance Reviews** | Schedule and document weekly/monthly review sessions |

Real-time notifications fire on escalations, comments, action assignments, and scheduled reviews — delivered via a bell dropdown in the top navigation.

## Tech stack

- **Framework** — Next.js 15 (App Router, Server Components, Server Actions)
- **Database** — PostgreSQL on [Neon](https://neon.tech) via Drizzle ORM
- **Auth** — Auth.js v5 with Google OAuth, JWT sessions, RBAC (executive / director / staff)
- **UI** — shadcn/ui v4, Tailwind CSS v4, Recharts
- **Language** — TypeScript

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/FelipeF2310/jcos.git
cd jcos
npm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

To set up Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI

### 3. Set up the database

```bash
npm run db:generate   # generate migrations
npm run db:migrate    # apply migrations
npm run db:seed       # seed with sample data
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

## Project structure

```
src/
├── app/
│   ├── (auth)/login/         # Sign-in page
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── executive/        # Executive scorecard
│   │   ├── departments/      # Department dashboards + metric entry
│   │   ├── issues/           # Issue tracker + detail view
│   │   ├── actions/          # Action management
│   │   └── reviews/          # Performance reviews
│   └── api/auth/             # Auth.js API handler
├── auth.ts                   # Auth.js config (Google OAuth, JWT, RBAC)
├── middleware.ts              # Route protection
├── components/
│   ├── header/               # TopHeader, NotificationBell, UserMenu
│   ├── scorecard/            # KPI cards
│   ├── charts/               # Sparkline
│   └── issues/               # Status badges
├── db/
│   ├── schema/               # Drizzle table definitions
│   └── migrations/           # Generated SQL migrations
└── server/                   # Server-side data access and mutations
```

## Roles

| Role | Access |
|---|---|
| `executive` | Full access — executive scorecard, all departments, escalation notifications |
| `director` | Department dashboards, issue/action management, review notifications |
| `staff` | Issue and action management |

User roles are managed directly in the database. New users default to `staff` on first sign-in.

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Drizzle Studio
```
