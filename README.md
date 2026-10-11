# Lmoussem

A mini event-management module: browse events, register for them, and manage them as an administrator. Built as the technical test for the development internship on the UM6P event platform.

## Demo

Not deployed yet. The demonstration URL will be added here.

## Features

| Feature | Details |
|---|---|
| List events | Cards showing date, place, description and remaining places |
| Create, edit, delete an event | Reserved to administrators, with validation on every field |
| Register a participant | A logged-in user registers for an event and can cancel |
| Capacity control | Registration is refused when the event is full, already passed, or already joined |
| Authentication | Sign-up and login with two roles: Admin and User |
| Search and filters | By text, place, date range, and "places left", applied automatically as you type or change a field |
| Instant feedback | Registering updates the button, the "Registered" badge and the capacity bar at once |
| Loading states | Skeleton placeholders while the pages and the filtered list load |
| Show / hide password | Eye button in the login and sign-up forms |
| Participants list | An administrator sees who registered for each event |

## Technologies

| Technology | Role |
|---|---|
| Next.js 16 (App Router) | Front-end pages and back-end REST API in one project |
| React 19 | User interface |
| TypeScript | Language |
| Tailwind CSS 4 | Styling |
| PostgreSQL (Neon) | Database |
| Prisma 6 | ORM and migrations |
| Auth.js (next-auth 5) | Authentication and sessions |
| bcryptjs | Password hashing |
| Zod 4 | Input validation |
| Vitest | Automated tests |
| Vercel | Hosting |

## Installation

Requirements: Node.js 24 or newer, and a PostgreSQL database (a free Neon project works).

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/yassir-ait-ammi/Lmoussem.git
   cd Lmoussem
   npm install
   ```

2. Create the environment file:

   ```bash
   cp .env.example .env
   ```

   Then fill it in:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Pooled connection string of the database |
   | `DIRECT_URL` | Direct connection string (on Neon: the same without `-pooler` in the host) |
   | `AUTH_SECRET` | A random secret, generated with `openssl rand -base64 33` |
   | `ADMIN_EMAIL` | Email of the administrator account to create |
   | `ADMIN_PASSWORD` | Password of the administrator account, at least 8 characters |

3. Create the tables, then the administrator account and sample events:

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

4. Start the application:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. Log in with the administrator account from `.env`, or sign up to get a normal user account.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm test` | Run the automated tests |
| `npm run typecheck` | Check the TypeScript types |
| `npm run db:migrate` | Create a migration after changing the schema |
| `npm run db:deploy` | Apply the migrations to the database |
| `npm run db:seed` | Create the administrator account and sample events |

## Architecture

One Next.js application in four layers. Each layer only calls the one below it.

```
Browser
   │
   ▼
Pages and components      src/app, src/components
   │
   ▼
REST API routes           src/app/api
   │  permissions and input validation
   ▼
Service layer             src/lib/events.ts, src/lib/users.ts
   │  business rules
   ▼
Prisma  ──────────────►   PostgreSQL
```

- **API routes** check who is calling, validate the input with Zod, and call a service function.
- **The service layer** holds all the logic. The pages and the API use the same functions.
- **Business rules** (`src/lib/rules.ts`) are pure functions, covered by tests.

```
prisma/
  schema.prisma       database tables
  migrations/         SQL migrations
  seed.mts            administrator account and sample events
src/
  auth.ts             Auth.js configuration
  lib/                validation, business rules, services, helpers, tests
  components/         interface components
  app/
    page.tsx          list of events with search and filters
    login/, signup/   authentication pages
    events/           event details, creation and edition pages
    api/              REST API
```

### Data model

| Table | Columns |
|---|---|
| `User` | name, email (unique), password hash, role (`ADMIN` or `USER`) |
| `Event` | title, description, date, place, capacity |
| `Registration` | user, event, with one registration per user and event |

### REST API

| Method | URL | Access | Purpose |
|---|---|---|---|
| GET | `/api/events` | Public | List events, with filters `q`, `place`, `from`, `to`, `available` |
| POST | `/api/events` | Admin | Create an event |
| GET | `/api/events/:id` | Public | Read one event |
| PUT | `/api/events/:id` | Admin | Edit an event |
| DELETE | `/api/events/:id` | Admin | Delete an event |
| GET | `/api/events/:id/registrations` | Admin | List the participants |
| POST | `/api/events/:id/registrations` | User | Register for the event |
| DELETE | `/api/events/:id/registrations` | User | Cancel the registration |
| POST | `/api/users` | Public | Create an account |

Errors share one format: `{ "error": { "code", "message", "fields" } }`.

### Design decisions

- **Permissions are enforced on the server.** Hiding a button is not security; every admin route checks the role.
- **The last place cannot be taken twice.** Registration runs in a database transaction that locks the event row, so two simultaneous requests cannot both get the final place.
- **The registered count is never stored.** It is counted from the registrations, so it cannot drift.
- **Capacity cannot be lowered below the number of people already registered.**
- **Filters live in the URL**, so a filtered list can be bookmarked and shared, and they apply automatically (the search waits for a short pause while typing).
- **Registration feels instant.** The new state is shown as soon as the server confirms it, while the page data refreshes in the background.

A complete walkthrough of the project is in [DOCUMENTATION.md](DOCUMENTATION.md).
