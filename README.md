# FreelanceHub

A full-stack freelance marketplace where clients post missions, freelancers apply, and both sides collaborate through contracts, deliverables, and real-time chat.

The project is split into two apps:

| App | Stack | Location |
| --- | --- | --- |
| Backend API | NestJS 11 · TypeORM · PostgreSQL · REST + GraphQL · WebSockets · JWT | [`backend/`](backend/) |
| Frontend | React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · Zustand | [`frontend/`](frontend/) |


## Features

- **Authentication** — register/login with JWT bearer tokens, role-based access (`admin`, `client`, `freelance`) via Passport local + JWT strategies.
- **Profiles** — separate client and freelance profiles, with skills (`competences`), daily rate, availability, and rating.
- **Missions** — clients post job missions with budget, deadline, required skills, and status (`draft` / `active` / `closed`).
- **Applications** — freelancers submit `candidatures` to missions.
- **Contracts** — accepted applications become `contrats` with deliverables (`livrables`), dual-signature tracking, and status lifecycle.
- **Real-time messaging** — Socket.IO gateway scoped per contract for live client/freelancer chat.
- **Search** — GraphQL queries with filtering, sorting, and pagination over freelance profiles and missions.
- **Webhooks** — register webhooks and inspect delivery logs.
- **API docs** — Swagger UI and GraphiQL exposed in development.

## Architecture

### Backend (NestJS)

Feature modules under [`backend/src/`](backend/src/):

- `auth` — registration, login, JWT/local strategies, guards (`JwtAuthGuard`, `RolesGuard`), and decorators (`@Public`, `@Roles`, `@CurrentUser`).
- `users` — users plus `client-profiles` and `freelance-profiles`.
- `competences` — skill catalog and freelance-skill links.
- `missions` — mission CRUD.
- `candidatures` — applications to missions.
- `contrats` — contracts, `livrables`, `messages` (+ Socket.IO `messages.gateway`), and message persistence.
- `webhooks` — webhook registration and logs.
- `search` — Apollo GraphQL resolver/service for filtered, paginated search.

Cross-cutting setup ([`main.ts`](backend/src/main.ts)): global `api` prefix, CORS enabled, global `ValidationPipe` (whitelist + transform), and Swagger at `/api`. GraphQL is served at `/graphql` with an auto-generated schema ([`app.module.ts`](backend/src/app.module.ts)).

### Frontend (React + Vite)

- Routing in [`App.tsx`](frontend/src/App.tsx): public landing page, `/login`, `/signup`, and a protected `/dashboard`.
- State via Zustand stores under [`frontend/src/store/`](frontend/src/store/) (`auth`, `missions`, `candidatures`, `contrats`, `freelancers`).
- API layer in [`lib/api.ts`](frontend/src/lib/api.ts): axios instance with a bearer-token interceptor plus a minimal GraphQL client.
- UI built with Tailwind CSS 4 and Radix primitives ([`components/ui/`](frontend/src/components/ui/)); dashboard tabs in [`components/dashboard/`](frontend/src/components/dashboard/).
- Vite dev server proxies `/api`, `/graphql`, and `/socket.io` to the backend on port 3000 ([`vite.config.ts`](frontend/vite.config.ts)).

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Getting started

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=freelancehub

# Auth
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=1d

# Optional
PORT=3000
NODE_ENV=development
```

Create the database, then start the API:

```bash
# create the database (once)
createdb freelancehub

# run in watch mode
npm run start:dev
```

The API runs at `http://localhost:3000`:
- REST endpoints under `/api`
- Swagger docs at `http://localhost:3000/api`
- GraphQL (with GraphiQL) at `http://localhost:3000/graphql`

> TypeORM `synchronize` is enabled automatically when `NODE_ENV` is not `production`, so tables are created from the entities on startup.

### 2. Seed sample data (optional)

```bash
cd backend
npm run seed
```

This creates demo users including:
- Client — `client@example.com` / `password`
- Freelance — `freelance@example.com` / `password`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies API/GraphQL/WebSocket traffic to the backend.

## Scripts

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start in watch mode |
| `npm run start:prod` | Run the compiled build (`dist/main`) |
| `npm run build` | Compile with the Nest CLI |
| `npm run seed` | Seed the database with sample data |
| `npm run test` | Run unit tests (Jest) |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and auto-fix |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the project |

## Tech stack

**Backend:** NestJS 11, TypeORM, PostgreSQL, Apollo Server (GraphQL), Passport (JWT + local), Socket.IO, class-validator, Swagger, bcrypt.

**Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS 4, Radix UI, Zustand, React Router 7, React Hook Form + Zod, Axios, socket.io-client.
