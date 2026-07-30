# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x (main) | Yes |
| < 1.0 | No |

---

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately by emailing the maintainers at the address listed
in `package.json`. You will receive an acknowledgement within 48 hours and a
resolution timeline within 7 days. We will credit you in the release notes unless
you prefer otherwise.

---

## Credential Rotation Runbook

> **Background.** The git history of this repository contains several secrets that
> were committed in plain text and pushed to a public repository. The files have
> been removed from HEAD, but **the secrets remain in git history and must be
> treated as fully compromised**. Rotation is mandatory. Purging history (see
> below) removes the evidence but does not invalidate credentials — rotate first,
> purge second.

### 1. GCP Service Account Key

**What was leaked:** A complete service-account JSON private key was committed in
two files: `server/google-credentials.json` and `server/key.json`.

- Service account: `speechtotextagri@speechtotext-457314.iam.gserviceaccount.com`
- Project: `speechtotext-457314`

**Rotation steps:**

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and navigate to
   **IAM & Admin → Service Accounts**.
2. Find the service account `speechtotextagri@speechtotext-457314.iam.gserviceaccount.com`.
3. Click the account, then open the **Keys** tab.
4. Identify every key in the `ACTIVE` state and click the three-dot menu beside
   each one → **Delete key**. This immediately invalidates the leaked private key.
5. Create a new key: **Add Key → Create new key → JSON**. Download the file.
6. Store the new key securely — **never commit it to the repository**. Preferred
   approaches (pick one):
   - Set `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`
     in `server/.env` (local dev) or your deployment secrets manager.
   - Set `GOOGLE_CREDENTIALS_JSON` to the entire JSON string in your CI/PaaS
     secrets — `env.js` accepts either variable.
7. Open **Cloud Logging → Logs Explorer** and query:

   ```
   resource.type="service_account"
   protoPayload.authenticationInfo.principalEmail="speechtotextagri@speechtotext-457314.iam.gserviceaccount.com"
   ```

   Look for calls to the Speech-to-Text or Text-to-Speech APIs that you did not
   initiate. Also check the project-level **IAM audit logs** for any permission
   grants that should not be there.

---

### 2. Nebius API Token

**What was leaked:** A Nebius Studio API bearer token was hardcoded in
`server/controllers/cropController.js`. According to the token metadata the key
was valid until 2030.

> **Current application status:** The application no longer calls Nebius at all.
> All LLM features have been migrated to Groq. Revoking this key is therefore
> pure cleanup — it has no service impact on the running application — but it is
> still mandatory because the token remains in git history and could be used to
> run up charges on the Nebius account.

**Rotation steps:**

1. Log in to the [Nebius Console](https://console.eu.nebius.com/).
2. Navigate to your service account or API key management section and **revoke**
   the compromised key immediately. No replacement is needed — the application
   no longer uses Nebius.
3. Review API call logs in the Nebius Console for any unexpected
   crop-recommendation requests that might indicate the key was already abused.

---

### 3. Groq API Key

**Where it lives and how it is injected:**

`GROQ_API_KEY` is a server-side secret. It must be set in `server/.env` for
local development, or injected via your deployment secrets manager / CI
environment for staging and production. The authoritative variable list is in
`server/config/env.js`.

**It must never appear in a `REACT_APP_*` variable.** React's CRA build inlines
every `REACT_APP_*` variable into the client bundle at compile time, making it
publicly readable by anyone who opens DevTools. The Groq client lives in
`server/utils/groq.js` and is only reachable from server-side code.

**If a Groq key is compromised:**

1. Log in to the [Groq Console](https://console.groq.com/keys).
2. Revoke the exposed key immediately.
3. Create a replacement key and set it in `server/.env` (or your secrets
   manager).
4. Check the Groq usage dashboard for unexpected requests.

**Degradation behaviour:** If `GROQ_API_KEY` is absent or revoked, the server
starts normally and logs a warning. Any call to an AI endpoint (`/api/ai/chat`,
`/api/crop/recommend`, `/api/pest-detection`) returns `503 Service Unavailable`.
Weather and speech are unaffected — they use different providers.

---

### 4. AssemblyAI and ElevenLabs API Keys

**What was leaked:** Both keys were placed in `client/src/config/apiKeys.js` and
shipped in every browser bundle sent to visitors.

- The client **no longer uses these providers**. Speech now runs server-side via
  Google Cloud Speech-to-Text and Text-to-Speech.
- The keys are therefore doubly dangerous: they appear in git history *and* were
  publicly accessible to anyone who loaded the site and opened DevTools.

**Rotation steps:**

1. **AssemblyAI** — log in at [assemblyai.com](https://www.assemblyai.com/) → API
   Keys, revoke the exposed key, and create a new one if the service is still
   needed. Note: the new architecture does not call AssemblyAI; revoke without
   replacement.
2. **ElevenLabs** — log in at [elevenlabs.io](https://elevenlabs.io/) → Profile →
   API Key, regenerate the key. Note: the new architecture does not call
   ElevenLabs; revoke without replacement.
3. Check usage dashboards on both platforms for anomalous calls.

---

### 5. GitHub Personal Access Tokens

**What was leaked:** Two GitHub PATs were hardcoded:

- `client/src/components/chatbot/Chatbot.js`
- `client/src/pages/carbon/CarbonFootprintCalculator.js`

**Rotation steps:**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens).
2. Find and **delete** both tokens immediately. GitHub may have already flagged and
   disabled them via its push-protection scanner — delete them regardless.
3. Open [github.com/settings/security-log](https://github.com/settings/security-log)
   (or **Settings → Security → Audit log**) and review events for any unexpected
   repository reads, forks, or OAuth authorizations tied to those tokens.
4. If a token had `repo:write` or `admin` scope, treat every repository it could
   access as potentially compromised and review recent push history.

---

## Purging Secrets from Git History

> **Important:** Rotation is mandatory and must happen before or alongside the
> purge. Removing a secret from git history does **not** invalidate it. Anyone
> who cloned or forked the repository before the purge may still have the secrets.
> The repository currently has 0 forks, which makes the blast radius smaller, but
> GitHub's cached API responses and search indexes may still hold the data until
> the caches expire.

### Preferred: `git-filter-repo`

Install:

```bash
pip install git-filter-repo
```

Run from the repository root (this rewrites the entire history):

```bash
# Remove the GCP key files
git filter-repo --path server/google-credentials.json --invert-paths
git filter-repo --path server/key.json --invert-paths

# Remove the client API key config file
git filter-repo --path client/src/config/apiKeys.js --invert-paths

# If you want to scrub by content (belt-and-suspenders pass), replace every
# literal occurrence of a known secret string. Example for a token fragment
# (replace YOUR_KNOWN_PREFIX with a unique, non-secret prefix of the token):
git filter-repo --replace-text <(echo "YOUR_KNOWN_PREFIX==>REDACTED")
```

Force-push all refs after the rewrite:

```bash
git push origin --force --all
git push origin --force --tags
```

Every collaborator **must delete their local clone and re-clone** after a
`filter-repo` rewrite. The rewritten history is incompatible with any existing
local copy.

### Alternative: BFG Repo-Cleaner

```bash
# Remove files by name
java -jar bfg.jar --delete-files google-credentials.json
java -jar bfg.jar --delete-files key.json
java -jar bfg.jar --delete-files apiKeys.js

# Remove secrets by string (put each secret on its own line in secrets.txt)
java -jar bfg.jar --replace-text secrets.txt

git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

BFG is faster for very large repos but less precise than `git filter-repo`.

### Contact GitHub Support

After pushing the rewritten history, submit a request at
[support.github.com](https://support.github.com) to clear GitHub's cache of the
old commits. Until the cache expires, the secrets may still be reachable via the
raw commit API even though they no longer appear in the repo tree.

---

## Current Security Posture

The following security controls are in place as of the production-ready rewrite:

| Layer | Control | Notes |
|-------|---------|-------|
| HTTP headers | `helmet` | CSP, HSTS, X-Content-Type-Options, etc. |
| CORS | Allowlist via `CORS_ORIGINS` | Defaults to `localhost:3000` in dev |
| Rate limiting | `express-rate-limit` | Separate limiters: general API (300/15 min), auth (10/15 min), AI (30/15 min) |
| NoSQL injection | `express-mongo-sanitize` | Strips `$`-prefixed and dotted keys from bodies and query strings |
| Input validation | `zod` schemas | Applied per-route before any controller logic runs |
| Authentication | `jsonwebtoken` (HS256) | Minimum 32-char secret enforced in production; tokens expire (default 7 days) |
| Passwords | `bcryptjs` | Default cost factor 12 |
| File uploads | `multer` + Cloudinary | Size limits enforced; files go to Cloudinary, not the repo or filesystem |
| AI provider keys | Server-side only | `GROQ_API_KEY` is injected via `server/.env` or a secrets manager; it must never appear in a `REACT_APP_*` variable |
| Weather | No credential required | Open-Meteo is called directly with no API key; the weather feature adds no new secret surface |
| Error handling | Central error handler | Stack traces suppressed in production responses |
| Secret scanning | Gitleaks (CI) | Runs on every push and pull request to `main` |
