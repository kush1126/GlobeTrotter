# GlobalTrotters

A full-stack multi-city travel planner, built to match the provided Excalidraw
mockup screen-for-screen: build itineraries section by section, assign
activities and per-section budgets, discover things to do by search, see day-
by-day costs and a real calendar, and share a trip publicly or with specific
collaborators.

## Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router
- **Infra**: Docker Compose (Postgres + backend + nginx-served frontend)

## Screen → route map

Every screen in the mockup has a corresponding route:

| # | Mockup screen | Route | Notes |
|---|---|---|---|
| 1 | Login | `/login` | photo circle, username, password |
| 2 | Registration | `/register` | photo circle, first/last name, email, phone, city, country, additional info |
| 3 | Main Landing | `/` | banner, top regional selections, previous trips, "+ Plan a trip" |
| 4 | Create a new Trip | `/trips/new` | dates, place, suggestion grid pulled from the activity catalog |
| 5 | Build Itinerary | `/trips/:id/build` | sections (= stops) each with description, date range, per-section budget |
| 6 | User Trip Listing | `/trips` | Ongoing / Upcoming / Completed, computed from each trip's dates |
| 7 | User Profile | `/profile` | avatar, editable name, Preplanned Trips, Previous Trips |
| 8 | Activity/City Search | `/discover` | search + group-by/filter/sort toolbar, result rows, "add to trip" |
| 9 | Itinerary + budget | `/trips/:id` (Itinerary tab) | Day 1 / Day 2 grouping per section, Activity/Expense columns |
| 10 | Community tab | `/community` | public trips from all users, with an explainer panel |
| 11 | Calendar view | `/calendar` | real month grid, trips shown as bars across their date range |
| 12 | Admin panel | `/admin` | tabs + placeholder charts — see **Known limitations** below |

Two mockup fields worth flagging explicitly:
- Registration's phone/city/country/additional-info fields are captured in
  the UI as shown, but only name/email/password are persisted — the User
  model doesn't store the others yet (see Known limitations).
- "Budget of this section" in Build Itinerary maps to a new `plannedBudget`
  column on `TripStop`, separate from the trip-wide budget aggregation.

## Project layout

```
globaltrotters/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # users, trips, stops (with plannedBudget), activities, budgets, shares
│   │   └── seed.ts            # sample activity catalog for /discover
│   └── src/
│       ├── server.ts
│       ├── middleware/auth.ts
│       └── routes/            # auth, trips, stops/activities, search, community, calendar
└── frontend/
    └── src/
        ├── lib/api.ts         # typed API client
        ├── hooks/useAuth.tsx
        ├── components/        # NavBar, Toolbar, RouteLine, CalendarMonth,
        │                      # GlobalCalendar grid, ItineraryDayView, TripCard
        └── pages/              # one per mockup screen (see table above)
```

## Running it

### Option A — Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

Migrations and the activity-catalog seed run automatically on backend startup.

### Option B — run locally

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev                 # http://localhost:4000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to :4000
```

You'll need a local PostgreSQL instance for option B, or just run the `db`
service from Compose: `docker compose up db`.

## Data model

```
User ─┬─< Trip ─┬─< TripStop ──< Activity
      │         │      (city, dates, plannedBudget)
      │         ├─< BudgetItem
      │         └─< TripShare >─ User (collaborator)
      └─< TripShare (shares with me)

ActivityCatalog   (standalone — powers /discover search, independent of any trip)
```

Key relational constraints:
- Every `Trip`, `TripStop`, `Activity`, `BudgetItem`, `TripShare` cascades on
  delete from its parent.
- Trip and stop dates are validated at the API layer (Zod) on create and update.
- `TripShare` has a unique `(tripId, sharedWithUserId)` constraint — re-inviting
  the same person updates their permission instead of duplicating a row.
- Section budgets (`TripStop.plannedBudget`) and trip-wide actuals
  (`groupBy` over `Activity.estimatedCost`) are tracked separately, matching
  the mockup's per-section budget field vs. the aggregate budget view.

## Auth & permissions

- JWT (7-day expiry), sent as `Authorization: Bearer <token>`.
- Every trip-mutating route re-derives access server-side:
  - **Owner**: full read/write, manages sharing.
  - **Collaborator with `edit`**: can add/edit stops and activities.
  - **Collaborator with `view`**: read-only.
  - The frontend hides edit controls based on `viewerCanEdit`; the API checks
    are the actual boundary, not the hidden button.
- Public trips are served from an unauthenticated route
  (`GET /api/public/trips/:shareToken`) that only returns data when
  `isPublic` is true.

## API reference

All routes below except `/auth/register`, `/auth/login`, `/search/*`,
`/community/*`, and `/public/*` require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | — |
| PATCH | `/api/auth/me` | `{ name?, avatarUrl? }` |

### Trips
| Method | Route | Body | Notes |
|---|---|---|---|
| GET | `/api/trips` | — | current user's trips |
| POST | `/api/trips` | `{ title, description?, startDate, endDate }` | |
| GET | `/api/trips/:id` | — | full detail incl. `viewerCanEdit`/`viewerIsOwner` |
| PATCH | `/api/trips/:id` | subset of create fields | owner or edit-collaborator |
| DELETE | `/api/trips/:id` | — | owner only |
| POST | `/api/trips/:id/stops` | `{ city, country, arrivalDate, departureDate, orderIndex, plannedBudget?, notes? }` | "section" in the mockup |
| GET | `/api/trips/:id/budget` | — | planned vs. actual, grouped by category |
| GET | `/api/trips/:id/calendar` | — | activities grouped by date |
| POST | `/api/trips/:id/share` | `{ makePublic?, inviteEmail?, permission? }` | owner only |
| DELETE | `/api/trips/:id/share/:shareId` | — | revoke a collaborator |

### Stops & activities
| Method | Route | Body |
|---|---|---|
| PATCH | `/api/stops/:id` | subset of stop fields (incl. `plannedBudget`) |
| DELETE | `/api/stops/:id` | — |
| POST | `/api/stops/:id/activities` | `{ name, category, date, startTime?, endTime?, estimatedCost, currency, notes? }` |
| PATCH | `/api/activities/:id` | subset of activity fields |
| DELETE | `/api/activities/:id` | — |

### Search / discovery (no auth)
| Method | Route | Query params |
|---|---|---|
| GET | `/api/search/activities` | `city`, `category`, `maxCost` |
| GET | `/api/search/destinations` | `q` |

### Community (no auth)
| Method | Route | Query params |
|---|---|---|
| GET | `/api/community/trips` | `q` — searches title and stop cities across public trips |

### Calendar
| Method | Route |
|---|---|
| GET | `/api/calendar/mine` | trips the user owns or collaborates on, as `{id, title, startDate, endDate}` for the month-grid bars |

### Public sharing (no auth)
| Method | Route |
|---|---|
| GET | `/api/public/trips/:shareToken` |

## Design notes

The UI's visual language comes from paper travel artifacts rather than
generic dashboard conventions: trip cards read like torn ticket stubs, and
the itinerary uses a hand-marked "route line" connecting stops as its one
signature element. Palette: deep navy ink, warm grey paper, route teal, and
an ochre accent reserved for costs. Typefaces: Fraunces (display), IBM Plex
Sans (body), IBM Plex Mono (dates, costs, all numeric/data text). The
mockup's structure — screens, groupings, field sets — was followed exactly;
this visual language is the layer on top of it.

## Known limitations / next steps

- **Admin panel** (`/admin`) is a layout-accurate stub: the charts render
  with placeholder data, since user management and real usage analytics
  (suspend/promote users, true popularity rankings) need endpoints beyond
  the original brief's data model. Wiring it for real would mean an
  admin-only role check plus aggregate queries over `User`/`Trip`/`Activity`.
- **Registration's phone/city/country/additional-info fields** are captured
  in the form but not persisted — the `User` model only has `name`, `email`,
  `avatarUrl`. Straightforward to add as columns if needed.
- No image upload for trip cover photos or user avatars (URL only).
- No email delivery for collaborator invites — the invited user sees the
  trip next time they check their own trips list.
- `ActivityCatalog` search is a simple `contains`/equality filter; a larger
  catalog would benefit from Postgres full-text search (`pg_trgm`).
- No automated test suite — routes were verified by typechecking (Zod +
  Prisma-generated types) and full production builds of both apps.
