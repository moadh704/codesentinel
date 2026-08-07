<div align="center">

<br/>

<img src="client/public/codesentinel-logo.svg" width="80" height="80" alt="CodeSentinel logo" />

<h1>CodeSentinel</h1>

<p><strong>AI-powered security code reviewer.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3-42b883?style=for-the-badge&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/DeepSeek-AI-4D6BFE?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" />
</p>

<br/>

</div>

---

## What is CodeSentinel?

CodeSentinel is a full-stack AI-powered security code reviewer that helps developers find vulnerabilities before they reach production.

Paste a code snippet, pick a language and AI provider, and get a structured report: severity, type, line references, vulnerable snippets, and fix suggestions — in a Linear-inspired dark UI.

**Supported providers:** DeepSeek (recommended), Claude, GPT-4o, Gemini, and Groq.

---

## Features

### Core
- Multi-provider AI analysis (DeepSeek, Claude, GPT-4o, Gemini, Groq)
- **API keys via Settings UI** (browser-stored) or `server/.env` fallback
- Local **demo/mock mode** when no key is available for the chosen provider
- Detailed vulnerability reports with snippets and recommended fixes
- Syntax highlighting (Shiki) with plain-text fallback if highlighting fails
- Print / Save as PDF export for scan reports
- Dashboard with stats and charts
- Scan history with filters

### Auth & Security
- JWT authentication (7-day expiry)
- bcrypt password hashing (10 rounds)
- Input validation with express-validator
- Parameterized SQL queries
- Rate limiting (general + strict on scans)
- Helmet security headers
- Strict CORS
- Provider keys from the UI are **not** written to the database (sent only with authenticated scan requests)

### UI & Experience
- Premium dark UI (Linear-inspired)
- Split-screen login/register with particle background
- Theme switcher (Dark / Dim / Light)
- Collapsible sidebar
- Toast notifications and custom confirm dialogs
- Resilient scan results page (loads findings even if highlighter is slow)

---

## Tech Stack

### Frontend — `/client`
| Layer       | Library                          |
|-------------|----------------------------------|
| Framework   | Vue 3 (Composition API)          |
| Build tool  | Vite 5                           |
| Styling     | Tailwind CSS + CSS variables     |
| State       | Pinia                            |
| Routing     | Vue Router 4                     |
| HTTP        | Axios                            |
| Charts      | ApexCharts + vue3-apexcharts     |
| Highlight   | Shiki                            |
| Icons       | lucide-vue-next                  |

**Fonts:** Bricolage Grotesque (headings) · DM Sans (body) · JetBrains Mono (code)

### Backend — `/server`
| Layer       | Library                          |
|-------------|----------------------------------|
| Runtime     | Node.js                          |
| Framework   | Express                          |
| Database    | MySQL / MariaDB (mysql2)         |
| Auth        | jsonwebtoken + bcryptjs          |
| AI          | DeepSeek (OpenAI-compatible), Anthropic, OpenAI, Google Generative AI, Groq |
| Validation  | express-validator                |
| Security    | helmet, express-rate-limit       |

---

## Project Structure

```
codesentinel/
├── client/                 # Vue 3 frontend (Vite)
│   └── src/
│       ├── lib/            # axios, apiKeys helpers
│       ├── views/          # Login, Scan, Settings, Results, …
│       └── composables/    # e.g. code highlighting
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB connection, env
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, rate limit
│   │   ├── routes/         # API routes
│   │   └── services/       # AI provider integrations
│   ├── scripts/            # DB init (init-db.sql)
│   ├── package.json
│   └── .env.example
├── start-local.bat         # Windows: start MySQL + API + UI
├── DESIGN.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+ or MariaDB (XAMPP MySQL is fine on Windows)
- Optional: an API key for at least one provider (DeepSeek recommended)

### 1. Clone & Install

```bash
git clone https://github.com/moadh704/codesentinel.git
cd codesentinel

# Backend
cd server
npm install
cp .env.example .env
# Edit .env: DB credentials (+ optional AI keys)

# Frontend
cd ../client
npm install
```

> On Windows, if peer dependency warnings appear for `vue3-apexcharts`:
> `npm install --legacy-peer-deps`

### 2. Database Setup

```bash
mysql -u root -p -e "CREATE DATABASE codesentinel;"
mysql -u root -p codesentinel < server/scripts/init-db.sql
```

Schema includes providers: `claude`, `gpt4`, `gemini`, `deepseek`, `groq`.

### 3. Run

**Option A — two terminals**

```bash
# Terminal 1: Backend (http://localhost:3000)
cd server
npm run dev

# Terminal 2: Frontend (http://localhost:5173)
cd client
npm run dev
```

**Option B — Windows helper**

```bat
start-local.bat
```

Starts MySQL (XAMPP if needed), API on `:3000`, UI on `:5173`, and opens the login page.

Prefer **http://127.0.0.1:5173** if `localhost` causes CORS quirks.

---

## Using the app

### API keys (recommended path)

1. Register or log in
2. Open **Settings → AI Provider API Keys**
3. Paste keys for the providers you use (DeepSeek, Claude, OpenAI, Gemini, Groq) → **Save**
4. Go to **New Scan**, pick that provider, paste code → **Analyze**

**Key resolution order for each scan:**

1. Key from Settings (sent with the authenticated request)
2. Matching key in `server/.env`
3. Neither → **demo/mock** findings (UI still works)

Keys in Settings stay in the browser (`localStorage`). They are not stored in MySQL.

### Sample vulnerable snippet (for a quick test)

```javascript
const password = 'admin123';
const q = "SELECT * FROM accounts WHERE id=" + req.params.id;
element.innerHTML = req.query.comment;
```

Language: **JavaScript** · Provider: **DeepSeek** (or any provider you configured).

### Export a report

On a completed scan, use **Export PDF** → browser print dialog → **Save as PDF**.

---

## Environment Variables (`server/.env`)

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=codesentinel
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=7d

# AI Providers (optional if keys are set in Settings UI)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=

# CORS (include both hostnames you use)
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

Copy from `server/.env.example`. **Never commit** `server/.env`.

---

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT with 7-day expiry
- Rate limiting on all endpoints (strict on scan creation)
- Parameterized queries (no SQL injection in app queries)
- Helmet security headers + strict CORS
- UI API keys: browser only + per-request; not persisted server-side
- Secrets and local debug artifacts are gitignored

---

## Development

Built as a personal security tool and learning project: multi-provider AI, local Windows/XAMPP workflows, and a Settings-first key flow for demos.

**License: Proprietary** — All rights reserved.

---

Built by [moadh704](https://github.com/moadh704).
