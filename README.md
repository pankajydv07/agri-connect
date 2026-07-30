# AgriConnect

AgriConnect is a digital marketplace that connects Indian farmers directly with
buyers, removing the need for middlemen and ensuring fairer prices for both
parties. The platform includes a voice-enabled multilingual assistant (English,
Hindi, Telugu) so that farmers with limited literacy or technical experience can
manage their products and orders using natural speech.

---

## What it is

- **Marketplace** — farmers list produce; buyers browse, place, and track orders.
- **Voice assistant** — speech-to-text and text-to-speech backed by Google Cloud,
  with Groq handling intent parsing and tool calls. The assistant is role-aware:
  it behaves differently for a logged-in farmer vs. a buyer. Buyer-side voice
  commands — searching products, placing orders (with explicit confirmation
  before any purchase fires), tracking orders, and weather queries — are fully
  wired. `placeOrder` requires the user to confirm before the order is submitted;
  a single ambiguous utterance cannot trigger a purchase.
- **Crop recommendation** — powered by Groq's `llama-3.3-70b-versatile` (or a
  model you configure via `GROQ_CHAT_MODEL`). Note: the previous implementation
  used a LoRA fine-tuned specifically for crop recommendation hosted on Nebius AI
  Studio. The current model is general-purpose, so the prompt does more
  structural work to compensate; output quality may differ from the previous
  version.
- **Pest and disease detection** — `POST /api/pest-detection` accepts a crop
  photo and returns a structured diagnosis: per-finding confidence, severity, and
  evidence; differential alternatives; and ordered treatment options (immediate,
  organic, chemical, preventive). Backed by Groq's vision model
  (`qwen/qwen3.6-27b` or `GROQ_VISION_MODEL`). See Known Limitations for an
  honest account of what the model can and cannot do.
- **Weather forecasts** — `GET /api/weather` returns current conditions, a daily
  forecast (1–7 days) with WMO weather codes translated to plain language and
  farming-specific advice, and a ready-made speakable summary string the voice
  assistant uses directly. Backed by Open-Meteo: free, no API key required.
- **Equipment maintenance logs** — farm equipment schedules are stored
  server-side in MongoDB, owner-scoped. Supports pagination, filtering by status
  and priority, full-text search across machine, task, technician and location,
  and sort. A status summary is included in every list response.
- **Multilingual** — English, Hindi, and Telugu are supported in the assistant
  and in portions of the UI (see Known Limitations).

---

## Architecture

```
Browser (React 18 / CRA)
  └── HTTPS ──► Express 4 API (port 5000)
                 ├── MongoDB 7  (Mongoose 7)
                 ├── Cloudinary (product image storage)
                 ├── Google Cloud Speech / TTS
                 └── Groq  (assistant, crop recommendation, pest detection)
```

Weather is fetched directly from Open-Meteo — no credential required, no extra
service to configure.

- **Monorepo**: `client/` is a Create React App project; `server/` is an Express
  application. They are independent npm workspaces within the same repository.
- **AI credentials are server-side only.** The browser never sees an API key.
  The client calls authenticated endpoints (`POST /api/ai/chat`,
  `POST /api/speech/transcribe`, `POST /api/speak`,
  `POST /api/crop/recommend`, `POST /api/pest-detection`,
  `GET /api/weather`, `GET /api/maintenance-logs`); the server holds every
  provider secret.
- **Generated TTS audio** is written to the OS temp directory and served at
  `/media/audio/...`. It is not stored in the repository or Cloudinary.
- **Security middleware**: helmet, CORS allowlist, per-route rate limiting,
  express-mongo-sanitize, zod request validation, centralised error handler.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ (20 recommended) |
| npm | 9+ |
| MongoDB | 7 (or use Docker) |
| Git | any recent version |

Optional integrations (the server starts without them; affected features return
503):

| Integration | Purpose |
|-------------|---------|
| Cloudinary | Product image upload |
| Groq | AI assistant, crop recommendation, pest detection |
| Google Cloud | Speech-to-text + text-to-speech |

Weather (Open-Meteo) requires no credential and is always available.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/agri-connect.git
cd agri-connect
```

### 2. Install dependencies

```bash
npm run install:all
```

This runs `npm install` in both `server/` and `client/`.

> **Note:** The lockfiles currently need regenerating. Run `npm install` (not
> `npm ci`) in `client/` and `server/` after cloning, and commit the updated
> lockfiles. CI temporarily uses `npm install` rather than `npm ci` for the same
> reason.

### 3. Configure the server environment

```bash
cp .env.example server/.env
```

Open `server/.env` and set at minimum:

```
MONGODB_URI=mongodb://127.0.0.1:27017/agriconnect
JWT_SECRET=<at-least-32-random-characters>
```

Every variable is documented in `.env.example`. The server will print a warning
at startup for each optional integration that is not configured, and will refuse
to start if a required variable is missing.

#### Groq API key

All AI features (assistant, crop recommendation, pest detection) require a Groq
API key. Get one at <https://console.groq.com/keys> and set it in `server/.env`:

```
GROQ_API_KEY=<your-key>
```

If `GROQ_API_KEY` is absent the server starts normally but any AI endpoint
returns `503 Service Unavailable` — it does not crash. Weather and speech work
independently of Groq.

The model IDs are overridable from the environment:

```
# Defaults shown; override if Groq deprecates a model
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
GROQ_VISION_MODEL=qwen/qwen3.6-27b
```

Groq deprecates preview models on short notice; check
<https://console.groq.com/docs/models> before pinning a model ID in a
long-running deployment.

**The client does not need its own `.env` file for local development.** If you
need to point the browser at a non-default API URL:

```bash
# client/.env  (create only if necessary)
REACT_APP_API_URL=http://localhost:5000
```

Do not put any provider API keys in `REACT_APP_*` variables. All credentials
belong in `server/.env` only.

---

## Running in development

```bash
# Terminal 1: API server with hot-reload (nodemon)
npm run dev:server

# Terminal 2: CRA dev server
npm run dev:client
```

The API listens on `http://localhost:5000`.
The client dev server listens on `http://localhost:3000`.

---

## Running tests

```bash
# Server tests (Jest + Supertest + mongodb-memory-server)
npm test --prefix server

# With coverage
npm run test:coverage --prefix server
```

No external database is required for the server tests — `mongodb-memory-server`
spins up an in-process instance automatically. Open-Meteo and Groq are mocked in
the test suite.

> **Important:** Tests for the weather, pest detection, and maintenance endpoints
> have been written but have not been run. The npm registry was blocked in the
> environment where these tests were developed, so dependencies could not be
> installed and the suite has not been verified. Run `npm install` in `server/`
> before attempting `npm test`.

```bash
# Client tests (React Testing Library, CRA default runner)
npm test --prefix client
```

---

## Running with Docker

Make sure you have Docker and Docker Compose (V2) installed.

```bash
# 1. Copy and fill in the server env file
cp .env.example server/.env
# Edit server/.env — set JWT_SECRET and GROQ_API_KEY at minimum.
# MONGODB_URI will be overridden by docker-compose to point at the mongo service
# unless you set it explicitly to mongodb://mongo:27017/agriconnect.

# 2. Build and start
docker compose up --build

# 3. The API is available at http://localhost:5000
```

The compose stack runs two services:

| Service | Image / Build | Notes |
|---------|---------------|-------|
| `mongo` | `mongo:7` | Data persisted to a named volume `mongo_data` |
| `api` | Built from `Dockerfile` | Passes `env_file: ./server/.env` |

To pass a production API URL into the React build:

```bash
REACT_APP_API_URL=https://api.example.com docker compose build
```

This is necessary because CRA inlines `REACT_APP_*` variables at compile time,
not at runtime.

---

## API endpoints

All endpoints that require authentication expect a `Bearer <token>` header.
Rate limits are enforced globally (300 req / 15 min per IP), with tighter limits
on auth (10 req / 15 min) and AI routes (30 req / 15 min).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness probe: returns DB connection state |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in; returns a JWT |
| GET | `/api/auth/me` | Yes | Get the current user's profile |
| GET | `/api/products` | No | List marketplace products |
| POST | `/api/products` | Yes (farmer) | Create a product listing |
| GET | `/api/products/:id` | No | Get a single product |
| PUT | `/api/products/:id` | Yes (owner) | Update a product |
| DELETE | `/api/products/:id` | Yes (owner) | Delete a product |
| GET | `/api/orders` | Yes | List orders for the current user |
| POST | `/api/orders` | Yes (buyer) | Place an order |
| PUT | `/api/orders/:id` | Yes | Update order status |
| GET | `/api/users/:id` | Yes | Get a user's public profile |
| PUT | `/api/users/:id` | Yes (self) | Update profile |
| GET | `/api/admin/users` | Yes (admin) | List all users |
| POST | `/api/ai/chat` | Yes | Send a message to the AI assistant (Groq) |
| POST | `/api/speech/transcribe` | Yes | Transcribe an audio file (Google STT) |
| POST | `/api/speak` | Yes | Synthesise speech from text (Google TTS) |
| POST | `/api/crop/recommend` | Yes | Get a crop recommendation (Groq) |
| POST | `/api/pest-detection` | Yes | Analyse a crop photo for pests/disease (Groq vision) |
| GET | `/api/weather` | Yes | Get forecast for a location (`?location=&days=1..7`) |
| GET | `/api/maintenance-logs` | Yes | List maintenance logs (paginated, filterable) |
| POST | `/api/maintenance-logs` | Yes | Create a maintenance log |
| PATCH | `/api/maintenance-logs/:id` | Yes (owner) | Update a maintenance log |
| DELETE | `/api/maintenance-logs/:id` | Yes (owner) | Delete a maintenance log |
| DELETE | `/api/maintenance-logs` | Yes | Delete all of the current user's logs |

The `/api/speak` path is an alias for `/api/speech` (kept for client
compatibility). The speech router answers both `'/'` and `'/speak'`.

### POST /api/pest-detection

Accepts `multipart/form-data`. Fields:

| Field | Required | Description |
|-------|----------|-------------|
| `image` | Yes | Photo of the affected plant |
| `cropHint` | No | Farmer-supplied crop name (improves accuracy) |
| `language` | No | `en` (default), `hi`, or `te` — localises text fields in the response |

Returns a structured object with `findings` (confidence, severity, evidence),
`differentials`, `immediateActions`, `organicTreatment`, `chemicalTreatment`,
`preventiveMeasures`, `needsExpertReview`, and `disclaimer`. `needsExpertReview`
is computed server-side and cannot be suppressed by the model.

Returns `422` when the image does not show a plant or is too blurry to assess.

---

## Project structure

```
agri-connect/
├── client/                      # React 18 (CRA) front-end
│   ├── public/
│   └── src/
│       ├── actions/             # Redux action creators
│       ├── components/          # Reusable UI components
│       ├── pages/               # Route-level page components
│       ├── reducers/            # Redux reducers
│       ├── store/               # Redux store configuration
│       ├── translations/        # i18n JSON files (en, hi, te)
│       └── utils/               # Helper functions
│
├── server/                      # Express 4 API
│   ├── config/
│   │   ├── env.js               # Boot-time env validation (authoritative var list)
│   │   └── logger.js            # Pino logger
│   ├── controllers/             # Route handler logic
│   ├── middleware/              # Auth, rate-limit, validation, error handling
│   ├── models/                  # Mongoose schemas (User, Product, Order, MaintenanceLog)
│   ├── routes/                  # Express routers
│   ├── utils/                   # Groq client, Cloudinary helpers, Google Cloud setup
│   ├── app.js                   # Express app (mountable for tests)
│   └── server.js                # Process entry point (connect, listen, shutdown)
│
├── .github/workflows/ci.yml     # GitHub Actions CI
├── .env.example                 # Documented env surface (safe to commit)
├── Dockerfile                   # Multi-stage build (client + server)
├── docker-compose.yml           # Local / staging stack
├── SECURITY.md                  # Credential rotation runbook
└── CONTRIBUTING.md              # Contributor guide
```

---

## Known limitations

- **Pest detection accuracy** — the pest detection endpoint is backed by
  `qwen/qwen3.6-27b`, a general-purpose vision model, not a trained plant
  pathology classifier. Replacing the previous placeholder (which returned a
  hardcoded diagnosis for every image) eliminates fabrication, but not
  inaccuracy: a confidently wrong diagnosis can still cost a farmer a crop.
  Every response therefore includes `needsExpertReview` (server-enforced, never
  suppressed) and a `disclaimer` directing the farmer to their local agricultural
  extension officer or Krishi Vigyan Kendra. This endpoint should be treated as
  a first-pass screening aid, not a substitute for expert diagnosis.

- **i18n coverage is partial** — three languages (English, Hindi, Telugu) exist
  with approximately 314 translation keys each and are in sync. However,
  `useTranslation` is wired into only about 4 of ~25 page components. The voice
  assistant, the navbar, and the home page are translated; most other pages fall
  back to English text. Full i18n coverage is deliberately deferred to a
  follow-up.

- **Test suite is unrun** — tests for the weather, pest detection, and
  maintenance endpoints have been written (Open-Meteo and Groq are mocked) but
  have not been executed. The npm registry was blocked during development, so
  dependencies were never installed and the suite has never run in CI. Run
  `npm install` in `server/` before attempting `npm test`, and expect the suite
  to need fixes.

- **Lockfiles need regenerating** — running `npm install` (not `npm ci`) in
  `client/` and `server/` is required to produce accurate lockfiles. CI
  temporarily uses `npm install` rather than `npm ci` for the same reason. Once
  lockfiles are committed, switch CI back to `npm ci` for deterministic installs.

- **Speech is intentionally not migrated to Groq** — Google Cloud still powers
  both speech-to-text and text-to-speech. Groq has no Telugu TTS voice, so
  migrating speech would break the Hindi/Telugu accessibility feature that makes
  the assistant usable for farmers with limited literacy. This is a deliberate
  decision, not an oversight.

---

## License

MIT. See `package.json`.
