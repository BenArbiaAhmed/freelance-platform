# Embark

**An AI-powered freelance marketplace.** Clients post missions, freelancers apply, and the platform does the screening: it parses resumes, matches candidates to missions by meaning rather than keywords, and runs async voice interviews that are transcribed and scored automatically.

Built with NestJS, React and PostgreSQL, with Qdrant for vector search and Groq-hosted LLMs for the AI features.

---

## Features

### AI
- **Resume understanding.** Uploaded CVs (PDF/DOCX) are converted to Markdown with LlamaParse, then turned into structured JSON by an LLM (Llama 3.3 70B on Groq). The JSON covers skills, experience, education, projects, certifications and languages, and is validated against a Zod schema with automatic retries.
- **Semantic matching in both directions.** Missions and resumes are embedded in-process with `multilingual-e5-large` (1024-d, French-friendly) and stored in Qdrant. Freelancers get recommended missions, and clients get ranked candidates. The ranking score is:
  `score = 0.8 · cosine similarity + 0.2 · skill Jaccard overlap`
- **AI voice interviews.** Each application can include an async interview. The LLM writes questions tailored to the mission, and the questions are read aloud with TTS. The candidate records spoken answers in the browser. Whisper transcribes the answers, and an LLM grades each one (0–100 with written feedback) for the client.
- **Graceful degradation.** Every AI stage has a fallback, so the app still runs with no API keys:
  - PDF parsing falls back to local `pdf-parse`.
  - Resume extraction falls back to heuristic keyword parsing.
  - Interview questions fall back to templates.
  - Scoring is skipped.
- **Restart-safe async pipelines.** Long AI jobs run in the background and track their progress with status fields. On boot, the app picks up any job that was interrupted.

### Platform
- Three roles (**admin**, **client**, **freelance**) with JWT auth, role guards and a guided onboarding flow.
- Full mission lifecycle: missions → applications → contracts → deliverables → payments.
- Real-time contract chat over **Socket.IO**, plus live application-status updates over **Server-Sent Events**.
- **GraphQL** search with filtering, sorting and pagination for freelancers and missions, alongside a documented **REST** API (Swagger).
- User-configurable **outgoing webhooks** (e.g. `mission.match`) with delivery logs.

---

## Architecture

```
┌──────────────┐     REST /api · GraphQL /graphql · WS /messages · SSE
│  React 19 +  │ ─────────────────────────────────────────────┐
│  Vite (SPA)  │                                              ▼
└──────────────┘                                   ┌─────────────────────┐
                                                   │     NestJS 11 API   │
                                                   │  auth · missions ·  │
                                                   │  candidatures ·     │
                                                   │  contrats · search  │
                                                   │  matching · resumes │
                                                   │  interviews · hooks │
                                                   └──┬───────┬───────┬──┘
                                                      │       │       │
                                       ┌──────────────┘       │       └───────────────┐
                                       ▼                      ▼                       ▼
                               ┌──────────────┐      ┌───────────────┐     ┌────────────────────┐
                               │ PostgreSQL 16│      │    Qdrant     │     │  AI providers      │
                               │  (TypeORM)   │      │ mission_/     │     │  LlamaParse · Groq │
                               └──────────────┘      │ resume_       │     │  (Llama 3.3,       │
                                                     │ embeddings    │     │   Whisper) · gTTS  │
                                                     └───────────────┘     └────────────────────┘
                                          fastembed (ONNX) runs inside the API process
```

**The resume pipeline:** upload → `EXTRACTING` → parse (LlamaParse) → structured extraction (Groq + Zod) → embed → upsert into Qdrant → `READY`

**The interview pipeline:** apply → generate questions → TTS playback → record answer → Whisper transcription → LLM scoring → client review

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, Zustand, React Hook Form + Zod, Socket.IO client |
| Backend | NestJS 11, TypeORM, Apollo GraphQL, Passport JWT, Socket.IO, Swagger |
| AI / ML | fastembed (`multilingual-e5-large` / `bge-small-en-v1.5`), Qdrant, Groq SDK (Llama 3.3 70B, Whisper large-v3), LlamaParse, Zod structured outputs, Ollama (optional self-hosted extractor) |
| Data & infra | PostgreSQL 16, Qdrant, Docker Compose |

---

## Getting started

### Prerequisites
- Node.js 20+
- Docker

### 1. Start the infrastructure
```bash
docker compose up -d postgres qdrant     # add `ollama` if you want the self-hosted extractor
```

### 2. Backend
```bash
cd backend
cp .env.example .env                     # optionally add GROQ_API_KEY and LLAMA_CLOUD_API_KEY
npm install
npm run seed                             # optional: load demo users, missions and contracts
npm run start:dev
```
The API runs on `http://localhost:3000`:
- **Swagger:** `/api`
- **GraphiQL:** `/graphql`

> On first boot, the embedding model (~2 GB for e5-large) is downloaded and cached. For a lighter, English-only setup, set `EMBEDDING_MODEL=bge-small-en`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                              # http://localhost:5173 (proxies /api, /graphql, /socket.io)
```

### Key environment variables

| Variable | Purpose | Without it |
|---|---|---|
| `GROQ_API_KEY` | Resume extraction, interview questions, transcription and scoring | Heuristic extraction, template questions, no transcription |
| `LLAMA_CLOUD_API_KEY` | High-quality PDF → Markdown parsing | Local `pdf-parse` |
| `EMBEDDING_MODEL` | `multilingual` (default) or `bge-small-en` | Multilingual e5 |
| `QDRANT_URL` | Vector database | `http://localhost:6333` |

See [`backend/.env.example`](backend/.env.example) for the full list, including model overrides and the interview question count.

---

## Project structure

```
backend/src/
├── auth/          JWT + local strategies, role guards
├── users/         users, client & freelance profiles
├── missions/      missions + embedding on create/update
├── resumes/       upload & async extraction pipeline
├── matching/      embeddings, Qdrant, LlamaParse, Groq extraction, hybrid scoring
├── interviews/    question generation, TTS, Whisper STT, answer scoring
├── candidatures/  applications + SSE status stream
├── contrats/      contracts, deliverables, WebSocket chat
├── paiements/     payments
├── search/        GraphQL search resolvers
├── webhooks/      webhook registry, dispatch & logs
└── seeds/         demo data
frontend/src/
├── pages/         landing, auth, onboarding, dashboard
├── components/    dashboard tabs, interview UI, shadcn-style primitives
├── store/         Zustand stores
└── lib/           API clients (REST, matching, interviews)
```

---

## Testing

```bash
cd backend
npm test          # unit tests (extraction heuristics, Groq extraction w/ retries)
npm run test:e2e
```

---

## Roadmap
- Move AI jobs to a proper queue (BullMQ + Redis)
- Replace `synchronize` with TypeORM migrations for production
- Expose the matching endpoints through GraphQL
- Let clients turn interviews on or off per mission, and add stricter ownership checks
