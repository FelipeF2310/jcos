# Jersey City OS

A CitiStat performance management platform for Jersey City government — built with Next.js 15, PostgreSQL, and Auth.js.

**Live demo:** [jcos-kappa.vercel.app](https://jcos-kappa.vercel.app)

## What it does

JCOS is meant to feel like a lightweight management *operating system*, not a data portal. It is organized around the questions leadership actually asks — *what improved, what declined, and where attention is needed* — rather than around charts. The goal is to reduce the need to manually review raw data every week by surfacing exceptions, trends, and risks in plain language for the Mayor, Business Administrator, department directors, and the CitiStat team.

### Executive layer

The first things leadership sees, designed to be scannable without clicking around.

| Surface | Answers | Description |
|---|---|---|
| **Weekly Brief** *(landing)* | "What should leadership know this week?" | Headline counts (metrics improving/declining, departments on target vs. requiring intervention), a **City Health Overview** band (green/yellow/red tally, month-over-month net, and three operational lenses), a **Department Status** list naming which departments are at *intervention / watch / on target* and why, top improvements, areas requiring attention, and upcoming risks. |
| **Executive Exceptions** | "Where is intervention needed?" | Only the metrics that need attention — each card shows current vs. target, period-over-period change, *why it matters*, and a suggested CitiStat follow-up question for the meeting agenda. A **Raise as issue** link pre-fills the issue tracker, closing the loop from exception to tracked work. |
| **Executive Scorecard** | "How is the city doing overall?" | City-wide KPI cards with status indicators and sparkline trends. |
| **Resident Intelligence** | "Are residents getting answers?" | Consolidated view of resident concerns and service demand by department. |

The executive layer reads from a single derived dataset (see [Architecture](#architecture)) so every number reconciles — the Brief's "declining" count *is* the cards on the Exceptions page.

### Operational modules

The working layer where issues are tracked and reviews are run, backed by PostgreSQL.

| Module | Description |
|---|---|
| **Department Dashboards** | Per-department metrics, trend charts, and metric data entry — status is computed polarity-aware (each metric knows whether higher or lower is better) |
| **Issue Tracker** | Log, prioritize, escalate, and resolve operational issues |
| **Action Management** | Corrective actions tied to issues with status tracking |
| **Performance Reviews** | Schedule and document weekly/monthly CitiStat review sessions |

Real-time notifications fire on escalations, comments, action assignments, and scheduled reviews — delivered via a bell dropdown in the top navigation.

## Architecture

JCOS has two data layers by design:

- **Operational modules** (departments, issues, actions, reviews, notifications) read and write **PostgreSQL** through Drizzle ORM — real records, mutated via Server Actions.
- **The executive layer** (Weekly Brief, Executive Exceptions, City Health) reads from a single canonical, in-code dataset in `src/lib/citistat/`. Every rollup and count is *derived* from that one source rather than hand-typed, so the surfaces can never contradict each other. This keeps the demo internally consistent with no database reseed, and is trivially portable into Postgres later.

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

Open [http://localhost:3000](http://localhost:3000) — the root redirects to the **Weekly Brief** at `/brief`.

## Project structure

```
src/
├── app/
│   ├── (auth)/login/         # Sign-in page
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── brief/            # Weekly Brief (landing)
│   │   ├── exceptions/       # Executive Exceptions
│   │   ├── executive/        # Executive scorecard
│   │   ├── resident-intelligence/  # Resident concerns + service demand
│   │   ├── departments/      # Department dashboards + metric entry
│   │   ├── issues/           # Issue tracker + detail view
│   │   ├── actions/          # Action management
│   │   └── reviews/          # Performance reviews
│   └── api/auth/             # Auth.js API handler
├── auth.ts                   # Auth.js config (Google OAuth, JWT, RBAC)
├── middleware.ts              # Route protection
├── components/
│   ├── citistat/             # StatusBadge, TrendIndicator, ExceptionCard
│   ├── header/               # TopHeader, NotificationBell, UserMenu
│   ├── scorecard/            # KPI cards
│   ├── charts/               # Sparkline
│   └── issues/               # Status badges
├── lib/
│   └── citistat/             # Canonical executive dataset + derived rollups
│       ├── data.ts           # Single source: metrics, departments, risks
│       └── derive.ts         # Pure derivations: brief, exceptions, city health
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

> **Demo mode:** authentication is currently disabled (`src/middleware.ts` has an empty matcher) so the live demo is browsable without sign-in. The Auth.js setup remains in place; restore the middleware matcher to re-enable route protection.

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript check (no emit)
npm run lint         # ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Drizzle Studio
```

CI (GitHub Actions) runs `typecheck` and `lint` on every push and pull request.

## Deploying

The app is hosted on Vercel at [jcos-kappa.vercel.app](https://jcos-kappa.vercel.app) and deployed via the Vercel CLI:

```bash
git push origin main      # update the repo
npx vercel --prod         # deploy to production
```

> **Note:** production deploys run through the CLI, not GitHub auto-deploy — pushing to `main` updates the repository but does **not** update the live site on its own. Run `npx vercel --prod` to publish.
