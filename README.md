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
  with OpenAI handling intent parsing. The assistant is role-aware: it behaves
  differently for a logged-in farmer vs. a buyer.
- **Crop recommendation** — powered by a fine-tuned LLM hosted on Nebius AI Studio.
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
                 ├── OpenAI (chat assistant)
                 └── Nebius AI Studio (crop recommendation)
```

- **Monorepo**: `client/` is a Create React App project; `server/` is an Express
  application. They are independent npm workspaces within the same repository.
- **AI credentials are server-side only.** The browser never sees an API key.
  The client calls authenticated endpoints (`POST /api/ai/chat`,
  `POST /api/speech/transcribe`, `POST /api/speak`,
  `POST /api/crop/recommend`); the server holds every provider secret.
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
| OpenAI | In-app AI chat assistant |
| Google Cloud | Speech-to-text + text-to-speech |
| Nebius AI Studio | Crop recommendation |

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
spins up an in-process instance automatically.

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
# Edit server/.env — set JWT_SECRET at minimum.
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
| POST | `/api/ai/chat` | Yes | Send a message to the AI assistant |
| POST | `/api/speech/transcribe` | Yes | Transcribe an audio file (Google STT) |
| POST | `/api/speak` | Yes | Synthesise speech from text (Google TTS) |
| POST | `/api/crop/recommend` | Yes | Get a crop recommendation (Nebius LLM) |

The `/api/speak` path is an alias for `/api/speech` (kept for client
compatibility).

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
│   ├── models/                  # Mongoose schemas (User, Product, Order)
│   ├── routes/                  # Express routers
│   ├── utils/                   # Cloudinary helpers, Google Cloud client setup
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

- **Pest Detection** — the pest-detection feature in the UI returns sample /
  placeholder data. It is not connected to a real model and should not be used
  for agricultural decisions.
- **Maintenance Logs** — the maintenance log feature displays demo data only.
  Persistence is not implemented.
- **i18n coverage is partial** — the voice assistant and several core pages are
  available in English, Hindi, and Telugu. A number of secondary pages have not
  yet been translated and will fall back to English.
- **Buyer voice commands** — buyer-side voice commands (search products, place
  orders, track orders) are marked as works in progress. The UI accepts voice
  input but not all actions are fully wired up.
- **Weather in the assistant** — weather-forecast voice queries are not yet
  implemented end-to-end.

---

## License

MIT. See `package.json`.
