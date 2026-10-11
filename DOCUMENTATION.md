# Lmoussem — Project Documentation

This file explains the project from A to Z: what it is, which technologies it uses and why, how the code is organised, and how each feature works. It is updated every time something is added.

## 1. What the project is

A mini event-management module, built as the technical test for the development internship on the UM6P event platform. Deadline: 12 October 2026.

The original brief is in `requirement.txt` (kept out of Git by `.gitignore`).

## 2. What must be delivered

| Area | Requirement | Type | Where it lives |
|---|---|---|---|
| Back-end | Create, list, edit, delete an event | Required | `src/app/api/events`, `src/lib/events.ts` |
| Back-end | Register a participant for an event | Required | `src/app/api/events/[id]/registrations` |
| Front-end | View the list of events | Required | `src/app/page.tsx` |
| Front-end | Add, edit, delete an event | Required | `src/app/events/new`, `src/app/events/[id]/edit`, `DeleteEventButton` |
| Front-end | Register a participant | Required | `RegisterButton` |
| Bonus | Simple authentication (Admin / User) | In scope | `src/auth.ts`, `src/lib/session.ts` |
| Bonus | Search and filters | In scope | `EventFilters`, `buildWhere` in `src/lib/events.ts` |
| Bonus | Deployment with a demo URL | In scope | Vercel (not done yet) |
| Deliverable | Source code on GitHub | Required | `github.com/yassir-ait-ammi/Lmoussem` |
| Deliverable | README | Required | `README.md` |

An event has five attributes: title, description, date, place, maximum capacity.

## 3. Technologies and why each was chosen

Every technology below was approved before being added.

| Technology | Role | Why |
|---|---|---|
| Node.js 24 | Runs JavaScript outside the browser | Required by Next.js; installed with nvm |
| Next.js 16 | Full-stack framework: pages and API in one project | One codebase for front-end and back-end, and the simplest deployment on Vercel |
| React 19 | Builds the user interface | Comes with Next.js |
| TypeScript | Language | Catches mistakes before running the code |
| Tailwind CSS 4 | Styling | Styles are written as class names directly on the elements |
| PostgreSQL on Neon | Database | A hosted database that works the same in development and in production |
| Prisma 6 | ORM, the layer between the code and the database | Tables are described in one schema file, queries are typed |
| Auth.js (next-auth 5) | Authentication | Handles login and sessions for Next.js |
| bcryptjs | Password hashing | Passwords are never stored in clear text; pure JavaScript, nothing to compile |
| Zod 4 | Input validation | Checks every piece of data that enters the server |
| Vitest | Automated tests | Proves the business rules work |
| Vercel | Hosting | Built for Next.js; deploys straight from GitHub |

Two things were deliberately left out because they were not approved: a linter (ESLint) and a date library.

### Configuration choices worth knowing

- **Prisma 6, not 7.** Version 7 needs extra adapter packages and a separate config file. Version 6 uses the classic setup: one schema file and one connection string.
- **Auth.js is a beta version (5.0.0-beta.32).** Version 5 is the one designed for the Next.js App Router, and it has not left beta. Its version is pinned exactly so an update cannot change behaviour by surprise.
- **Cache Components are turned off** in `next.config.ts`. The Next.js generator enables this caching feature by default, but every page here depends on who is logged in and on live registration counts, so pages are rendered fresh on each request.
- **`allowScripts` in `package.json`.** Recent npm versions do not run a package's install script unless it is approved. Prisma needs its script to download its database engine, so its three packages are listed there.
- **`experimental.authInterrupts`** in `next.config.ts` enables the `forbidden()` function used for the "Access denied" page (see the Error pages section).
- **`agentRules: false`** in `next.config.ts` stops Next.js from generating an `AGENTS.md` file each time the development server starts.
- **`postinstall: prisma generate`.** Prisma generates typed code from the schema. Running it after every install means it also runs on Vercel.

## 4. Architecture

The project is one Next.js application split into four layers. Each layer only talks to the one below it.

```
Browser
   │
   ▼
Pages and components      src/app/**/page.tsx, src/components
   │  read data directly from the service layer
   │  change data by calling the API with fetch
   ▼
API routes                src/app/api/**/route.ts
   │  check who is calling, validate the input
   ▼
Service layer             src/lib/events.ts, src/lib/users.ts
   │  apply the business rules
   ▼
Prisma  ──────────────►   PostgreSQL (Neon)
```

Why this split:

- **The API routes are thin.** Each one does three things: check permissions, validate input, call a service function. They contain no business logic.
- **The service layer holds the logic.** The list page and the API both call the same `listEvents` function, so the rules exist in one place only.
- **The business rules are pure functions** (`src/lib/rules.ts`): they take numbers and dates and return an answer, with no database involved. That is what makes them easy to test.

### Folder map

```
prisma/
  schema.prisma            the database tables
  migrations/              the SQL that creates the tables, generated by Prisma
  seed.mts                 creates the admin account and sample events
src/
  auth.ts                  Auth.js configuration (login logic, session content)
  types/next-auth.d.ts     adds "id" and "role" to the session types
  lib/
    prisma.ts              the single database connection
    validation.ts          Zod schemas for events, sign-up, login, filters
    rules.ts               business rules as pure functions
    errors.ts              AppError: an error with a code and an HTTP status
    events.ts              service layer for events and registrations
    users.ts               service layer for account creation
    session.ts             getCurrentUser, requireUser, requireAdmin
    api.ts                 server helpers: parse input, turn errors into JSON
    client.ts              browser helper: call the API and read the result
    format.ts              date formatting
    rules.test.ts          tests for the business rules
    validation.test.ts     tests for the validation
  components/
    Header.tsx             top bar, shows login state and log out
    EventCard.tsx          one event in the list
    EventList.tsx          count, "New event" button and grid of cards for the current filters
    EventListSkeleton.tsx  grey placeholder of the list, shown while it loads
    Skeleton.tsx           one pulsing grey block, the brick of every skeleton
    CapacityBar.tsx        "12 / 50 registered" bar
    EventFilters.tsx       search and filter form, applied automatically
    FiltersSection.tsx     loads the places and renders EventFilters
    RegistrationProvider.tsx  shared registration state of one event: button, badge and capacity bar
    EventForm.tsx          create and edit form
    RegisterButton.tsx     register / cancel registration
    DeleteEventButton.tsx  delete with a confirmation step
    LoginForm.tsx          login form
    SignupForm.tsx         sign-up form
    PasswordInput.tsx      password field with a show / hide eye button
    StatusMessage.tsx      big status code, title, message and buttons, used by the error pages
    ui.ts                  shared button, input and card styles
  app/
    layout.tsx             page shell used by every page
    globals.css            colours and fonts
    page.tsx               home: filters and list of events
    loading.tsx            skeleton of the home page while it loads
    not-found.tsx          404 page for any unknown address
    forbidden.tsx          403 page for a logged-in user who is not an admin
    error.tsx              page shown when something unexpected fails
    login/page.tsx         login page
    signup/page.tsx        sign-up page
    events/new/page.tsx            create an event (admin)
    events/[id]/page.tsx           event details, participants for admin
    events/[id]/loading.tsx        skeleton of the event page while it loads
    events/[id]/edit/page.tsx      edit an event (admin)
    events/[id]/not-found.tsx      404 page for an event that does not exist
    api/                           the REST API, see section 6
```

### Server components and client components

Next.js has two kinds of components:

- **Server components** (the default) run on the server only. They can read the database directly. Pages, `Header`, `EventCard`, `EventList` and `FiltersSection` are server components.
- **Client components** start with `"use client"` and also run in the browser. They are needed for anything interactive: forms with state and buttons with click handlers. `EventFilters`, `EventForm`, `RegisterButton`, `RegistrationProvider`, `DeleteEventButton`, `LoginForm`, `SignupForm` and `PasswordInput` are client components.

After a client component changes data through the API, it calls `router.refresh()`, which asks the server to render the page again with fresh data. Because that refresh takes a moment, registration shows its result immediately in the meantime (see section 12).

## 5. Database

Defined in `prisma/schema.prisma`. Three tables:

```
User                    Registration               Event
────────────            ──────────────             ────────────
id                ◄──── userId                     id
name                    eventId            ────►   title
email (unique)          createdAt                  description
passwordHash            unique(eventId, userId)    date
role (ADMIN | USER)                                place
createdAt                                          capacity
                                                   createdAt, updatedAt
```

- A **Registration** row means "this user is registered for this event".
- `unique(eventId, userId)` makes the database itself refuse a double registration.
- `onDelete: Cascade` means deleting an event also deletes its registrations.
- The number of registered people is never stored; it is counted from the Registration table, so it can never be out of sync.

Two connection strings are used:

- `DATABASE_URL`: the pooled Neon connection, used by the application.
- `DIRECT_URL`: the direct Neon connection, used by Prisma only when it changes the tables.

## 6. The REST API

All responses are JSON. Errors always have the same shape:

```json
{ "error": { "code": "EVENT_FULL", "message": "This event is full", "fields": {} } }
```

`fields` is present for validation errors and maps each field name to its message.

| Method | URL | Who | What it does | Success |
|---|---|---|---|---|
| GET | `/api/events` | Anyone | List events; accepts the filters `q`, `place`, `from`, `to`, `available` | 200 |
| POST | `/api/events` | Admin | Create an event | 201 |
| GET | `/api/events/:id` | Anyone | Read one event | 200 |
| PUT | `/api/events/:id` | Admin | Edit an event | 200 |
| DELETE | `/api/events/:id` | Admin | Delete an event | 204 |
| GET | `/api/events/:id/registrations` | Admin | List the participants | 200 |
| POST | `/api/events/:id/registrations` | Logged-in user | Register yourself | 201 |
| DELETE | `/api/events/:id/registrations` | Logged-in user | Cancel your registration | 200 |
| POST | `/api/users` | Anyone | Create a user account | 201 |
| GET, POST | `/api/auth/*` | Anyone | Login, logout, session (handled by Auth.js) | |

Error codes and their HTTP status (`src/lib/errors.ts`):

| Code | Status | Meaning |
|---|---|---|
| `VALIDATION` | 400 | The input is invalid |
| `UNAUTHENTICATED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Logged in but not an admin |
| `NOT_FOUND` | 404 | The event does not exist |
| `EVENT_FULL` | 409 | No places left |
| `EVENT_PASSED` | 409 | The event date is in the past |
| `ALREADY_REGISTERED` | 409 | The user is already registered |
| `NOT_REGISTERED` | 409 | Cancelling a registration that does not exist |
| `CAPACITY_BELOW_REGISTRATIONS` | 409 | Capacity edited below the number of participants |
| `EMAIL_TAKEN` | 409 | Sign-up with an email that already has an account |

## 7. Business rules

| Rule | Where it is enforced |
|---|---|
| Title 3–120 characters, description 10–2000, place 2–120 | `eventSchema` in `validation.ts` |
| Capacity is a whole number from 1 to 100000 | `eventSchema` |
| A registration is refused when the event is full | `checkRegistration` in `rules.ts` |
| A registration is refused when the event is in the past | `checkRegistration` |
| A user cannot register twice | `checkRegistration`, plus the unique constraint in the database |
| Capacity cannot be lowered below the current registrations | `canLowerCapacity`, called by `updateEvent` |
| Only an admin creates, edits, deletes events and sees participants | `requireAdmin` in every such API route |
| Passwords are 8–72 characters and stored hashed | `signUpSchema`, `createUser` |

### The "last place" problem

If two people click Register at the same moment on an event with one place left, both requests could count "1 place left" and both could be accepted. `registerForEvent` prevents this:

1. It opens a database transaction.
2. It locks the event row with `SELECT ... FOR UPDATE`. The second request has to wait here.
3. It counts the registrations and applies `checkRegistration`.
4. It inserts the registration and commits, which releases the lock.

The second request then counts again, sees the event is full, and is refused.

## 8. Authentication

- **Sign-up** (`POST /api/users`): validates the input, refuses an email that is already used, hashes the password with bcrypt, and creates the account with the `USER` role. Nobody can sign up as an admin.
- **Admin account**: created by the seed script from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.
- **Login**: `LoginForm` calls `signIn("credentials")`. Auth.js runs the `authorize` function in `src/auth.ts`, which finds the user by email and compares the password with the stored hash.
- **Session**: on success, Auth.js stores a signed, encrypted token (JWT) in an HTTP-only cookie. The token contains the user id and role. It is signed with `AUTH_SECRET`, so it cannot be forged or modified.
- **Reading the session**: `getCurrentUser()` in `session.ts`. It reads the user id from the cookie, then loads that user from the database. If the account no longer exists, the visitor is treated as a guest. `requireUser()` and `requireAdmin()` throw an `AppError` (401 or 403) when the condition is not met.
- **Why the database is checked on every request**: the cookie alone stays valid for 30 days, even if the account behind it is deleted or the database is reset. Checking the database means a deleted account loses access immediately, and a change of name or role takes effect at once. The cost is one small query per request; React's `cache()` makes sure it runs only once even when the header and the page both ask for the user.
- **Show / hide password**: `PasswordInput` (used by the login and sign-up forms) puts an eye button inside the field. The eye is open while the password is visible and slashed while it is hidden. The button is `type="button"`, so it never submits the form, and it has an `aria-label` for screen readers.
- **Protection happens on the server.** Hiding the Edit button from a normal user is only for comfort; the real protection is `requireAdmin()` inside the API routes and the redirect at the top of the admin pages.

## 9. Search and filters

`EventFilters` is a client component. The filters go in the URL (`/?q=pitch&place=Rabat&available=1`), so the result can be bookmarked and shared, and the form is still a plain GET form that works without JavaScript.

The filters are **applied automatically**, there is no Apply button:

| Field | When it applies | How |
|---|---|---|
| Place, From, To, "places left" | Immediately on change | `router.push`, so Back returns to the previous filters |
| Search | 350 ms after the last keystroke, or at once on Enter | `router.replace`, so typing does not fill the browser history |
| Reset | On click | Clears every field and goes back to `/` |

Details that make this comfortable:

- The page is split so that the filter form stays mounted while results reload: `page.tsx` puts `FiltersSection` and `EventList` in two `Suspense` boundaries, and only the list one is keyed by the filters. The search field therefore keeps its focus while the list shows its skeleton.
- While the new results load, a small spinner and "Updating..." appear next to Reset (`useTransition`), and the form is marked `aria-busy`.
- A `useEffect` keeps the fields in sync with the URL after Back / Forward or Reset, without overwriting the field being typed in.

| Filter | URL parameter | How it is applied |
|---|---|---|
| Search | `q` | Title or description contains the text, ignoring case |
| Place | `place` | Place contains the text; the list of choices comes from existing events |
| From / To | `from`, `to` | Event date within the range (`YYYY-MM-DD`) |
| Places left | `available=1` | Keeps events that are not full |

The first three are done by the database (`buildWhere`). "Places left" is done in code after the query, because it compares a column with a count.

## 10. Error pages

Next.js picks these files up by their name; nothing has to be wired manually.

| File | Shown when | Text |
|---|---|---|
| `src/app/not-found.tsx` | The address matches no page | "Page not found" |
| `src/app/events/[id]/not-found.tsx` | The event id in the address does not exist; the event pages call `notFound()` | "Event not found" |
| `src/app/forbidden.tsx` | A logged-in user without the admin role opens an admin page; those pages call `forbidden()` | "Access denied" |
| `src/app/error.tsx` | Something unexpected fails while rendering a page, for example the database is unreachable | "Something went wrong", with a "Try again" button |

All four use the `StatusMessage` component, so they share one design: the status code in large UM6P orange, a title, a short explanation and a button back to the events. They are rendered inside the normal layout, so the header stays visible.

The 404 pages still answer with the HTTP status 404, and the "Access denied" page with 403, which is what browsers and search engines expect.

What each kind of visitor gets on an admin page (`/events/new`, `/events/:id/edit`):

| Visitor | Result | Why |
|---|---|---|
| Not logged in | Redirected to `/login`, then sent back to the page after logging in | They may well be an admin who has not logged in yet |
| Logged in as a normal user | "Access denied" page, status 403 | Logging in again would not help; they simply lack the right |
| Logged in as admin | The page | |

`forbidden()` is a Next.js feature still marked experimental, so it is switched on with `experimental.authInterrupts` in `next.config.ts`.

`error.tsx` must be a client component; that is a Next.js rule, because it has to catch errors in the browser too.

## 11. Loading states

The pages read from a remote database, so a navigation or a filter change takes a moment. Instead of leaving the old page frozen, grey skeleton placeholders show the shape of what is coming.

| File | Shown when |
|---|---|
| `src/app/loading.tsx` | The home page loads (title, filter box and a grid of placeholder cards) |
| `src/app/events/[id]/loading.tsx` | An event page loads |
| `Suspense` fallback in `src/app/page.tsx` | The filters change: only the count and grid are replaced by `EventListSkeleton`, the filter form stays |

Next.js picks `loading.tsx` up by its name. `Skeleton` is one pulsing block (`animate-pulse`); the skeletons are built from it and use the same card styles as the real pages, so nothing jumps when the data arrives. Login and sign-up have no loading page: they have no server data to wait for, and their buttons already show "Logging in..." and "Creating account...".

## 12. Instant feedback when registering

After a click on Register or Cancel, three things on the page depend on the result: the button, the "Registered" badge and the capacity bar. The real data only arrives after `router.refresh()`, which needs another round-trip to the database, so without care the old state stayed visible for a moment.

`RegistrationProvider` (a client component wrapping each event card and the event page) holds the state of one event in a React context and is read by `RegisterButton`, `RegisteredBadge` and `LiveCapacityBar`:

1. The user clicks. The button shows "Registering..." (or "Cancelling...").
2. When the API confirms, the provider shows the new state at once: the registered flag flips and the count moves by one, so the badge, the "N / capacity" text, the "places left" label and the bar all change together.
3. `router.refresh()` runs in the background. When the refreshed props agree with the shown state, the provider goes back to using the server values.
4. If the request fails, nothing is shown as changed and the error message appears under the button.

The server stays the source of truth: the shown state is only a short-lived preview of an answer the server has already confirmed.

Each of the two buttons has its own `key`. Without it React reuses the same `<button>` element, and the `transition-colors` of the button style made the color fade from orange to white and back.

## 13. Colours

All colours are defined once, in `src/app/globals.css`, and used everywhere through Tailwind class names such as `bg-brand` or `text-muted`. Changing a value there changes it across the whole site.

| Name | Value | Used for |
|---|---|---|
| `brand` | `#d4451e` | Main buttons, links, logo text. This is the primary colour of the UM6P website (its `--primary-color`), read from um6p.ma on 10 October 2026 |
| `brand-strong` | `#b23717` | Hover state of buttons, text on a light orange background |
| `brand-soft` | `#fbe9e3` | Light orange backgrounds: date block, role badge |
| `surface` | `#faf7f2` | Page background |
| `card` | `#ffffff` | Cards and form fields |
| `ink` | `#1f1b16` | Main text |
| `muted` | `#6b6258` | Secondary text |
| `line` | `#e6dfd4` | Borders |
| `ok` / `ok-soft` | `#2f6b4f` / `#e3f0e9` | "Registered" badge, places left |
| `danger` / `danger-soft` | `#b3261e` / `#fbe9e7` | Errors, delete button, "Full" |

The UM6P logo itself uses a slightly brighter orange, `#ea3b15`; the site's buttons and links use `#d4451e`, which is the one adopted here.

## 14. Dates and time zones

- The database stores dates in UTC.
- Dates are displayed in Morocco time (`Africa/Casablanca`), set in `src/lib/format.ts`.
- The event form sends the date as an ISO string, converted by the browser from its local time.

Known limitation: the form assumes the browser is on Morocco time. Someone creating an event from another time zone would see the displayed time shifted. The From / To filters use UTC days, so an event between midnight and 1 am Morocco time is counted on the previous day.

## 15. Tests

Run with `npm test`. They need no database.

- `src/lib/rules.test.ts`: remaining places, full event, past event, double registration, lowering capacity.
- `src/lib/validation.test.ts`: valid and invalid events, sign-up input, filters.

## 16. Commands

| Command | What it does |
|---|---|
| `npm install` | Install the dependencies and generate the Prisma client |
| `npm run dev` | Start the site on http://localhost:3000 |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm test` | Run the tests |
| `npm run typecheck` | Check the TypeScript types without building |
| `npm run db:migrate` | Create or update the tables in the database (development) |
| `npm run db:deploy` | Apply existing migrations to a database (production) |
| `npm run db:seed` | Create the admin account and sample events |

## 17. Environment variables

Stored in `.env`, which is never committed. `.env.example` lists them without real values.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon connection string |
| `DIRECT_URL` | Direct Neon connection string |
| `AUTH_SECRET` | Secret used to sign the session cookie |
| `ADMIN_EMAIL` | Email of the admin created by the seed |
| `ADMIN_PASSWORD` | Password of the admin created by the seed |

## 18. How it was verified

On 10 October 2026 the application was run against the Neon database and every feature was exercised through the API with temporary accounts, which were deleted afterwards.

| Check | Result |
|---|---|
| Sign-up: valid, duplicate email, invalid fields, broken JSON | 201, 409, 400, 400 |
| Login as admin and as user; wrong password | Session with the right role; no session |
| Create, edit, delete an event as visitor / user / admin | 401 / 403 / success |
| Participants list as user / admin | 403 / 200 |
| Register, register twice, register on a full event | 201, 409, 409 |
| Cancel, cancel twice, register in the freed place | 200, 409, 201 |
| Lower capacity below the registrations | 409 |
| Three users registering at the same instant for one place | One 201, two 409 |
| Register for a past event | 409 |
| Filters: text, place, date range, places left, no match | Correct lists |
| Pages as visitor / user / admin | Admin pages redirect visitors to login and give users a 403; unknown event gives 404 |

Not verified: the visual appearance of the pages in a browser, including the loading skeletons, the automatic filters and the instant registration feedback added afterwards (checked with the type-check only).

## 19. Status

| Step | State |
|---|---|
| Requirements read and stack chosen | Done |
| Node.js installed | Done |
| Project generated and dependencies installed | Done |
| Type-check (`npm run typecheck`) | Passing |
| Tests (`npm test`) | 28 passing |
| Production build (`npm run build`) | Passing |
| Neon database created, tables created (`prisma/migrations`) | Done |
| Sample events seeded | Done |
| Back-end, authentication, filters | Verified through the API |
| Front-end pages | Rendering; appearance not yet checked in a browser |
| Admin account | Waiting for `ADMIN_PASSWORD` in `.env`, then `npm run db:seed` |
| README | Done, demo URL to add |
| GitHub repository | Exists, latest work not yet pushed |
| Deployment on Vercel | Not started |
