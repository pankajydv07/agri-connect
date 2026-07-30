# Contributing to AgriConnect

Thank you for your interest in contributing. This document explains how to set
up the project locally, what conventions to follow, and how the review process
works.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local setup](#local-setup)
3. [Development workflow](#development-workflow)
4. [Code style](#code-style)
5. [Testing](#testing)
6. [Submitting a pull request](#submitting-a-pull-request)
7. [Security issues](#security-issues)

---

## Prerequisites

- Node.js 20 (18 is also supported — see `.nvmrc` or `engines` in `package.json`)
- npm 9+
- MongoDB 7 (or Docker — see below)
- Git

---

## Local setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/agri-connect.git
cd agri-connect

# 2. Install all dependencies
npm run install:all

# 3. Create the server env file
cp .env.example server/.env
# Edit server/.env — at minimum set MONGODB_URI and JWT_SECRET.
# See .env.example for documentation of every variable.

# 4. (Optional) Start MongoDB via Docker if you don't have it locally
docker run -d --name mongo7 -p 27017:27017 mongo:7
```

The client does not require its own `.env` file for local development. All API
calls go to `http://localhost:5000` by default. If you need a different URL,
create `client/.env` and set `REACT_APP_API_URL=http://your-api-host`.

**Never put API keys in `REACT_APP_*` environment variables.** All provider
credentials (OpenAI, Google Cloud, Nebius, Cloudinary) are server-side only.
See `SECURITY.md` for background on why this rule exists.

---

## Development workflow

Start the server and client in two terminals:

```bash
# Terminal 1 — API server with hot-reload
npm run dev:server

# Terminal 2 — CRA dev server
npm run dev:client
```

The server listens on port 5000 and the client on port 3000. The CRA dev server
proxies `/api` requests to port 5000 automatically (set via the `proxy` field in
`client/package.json` if present, or by `REACT_APP_API_URL`).

---

## Code style

### Server (Node / CommonJS)

- ESLint (`server/.eslintrc.json`) + Prettier (`server/.prettierrc`)
- Run `npm run lint --prefix server` to check; `npm run format --prefix server` to auto-fix.
- Key rules: `no-unused-vars` is an error; `no-console` is a warning (use the
  `pino` logger instead).

### Client (React / JSX)

- `eslint-config-react-app` (CRA default) + Prettier.
- Run `npm run lint --prefix client`.

### Commits

Use conventional commit messages where possible:

```
feat: add voice-command product listing for buyers
fix: prevent JWT expiry from silently defaulting to never
docs: update API table in README
```

---

## Testing

The server test suite uses Jest + Supertest with `mongodb-memory-server` — no
external database is required.

```bash
# Run once
npm test --prefix server

# Watch mode
npm run test:watch --prefix server

# Coverage report
npm run test:coverage --prefix server
```

When adding a new controller or route, add a corresponding test file under
`server/tests/`. The jest config picks up all `**/*.test.js` files relative to
`server/`.

The client uses React Testing Library (`npm test --prefix client`). CRA's default
watch mode is used locally.

---

## Submitting a pull request

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes. Keep commits focused — one logical change per commit.
3. Ensure lint and tests pass locally:
   ```bash
   npm run lint
   npm test
   ```
4. Push your branch and open a pull request against `main`.
5. Fill in the PR template. Link any related issue.
6. A maintainer will review within 3 business days. Address review feedback in
   new commits rather than force-pushing (it makes the diff easier to follow).
7. PRs are merged with a squash merge to keep the `main` history linear.

---

## Security issues

Please do not open a public GitHub issue for vulnerabilities. See
[SECURITY.md](./SECURITY.md) for the responsible-disclosure process.
