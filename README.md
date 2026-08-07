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

CodeSentinel is a full-stack AI-powered security code reviewer that helps developers identify vulnerabilities before they reach production.

Paste code (or a snippet), pick a language and AI provider, and get a structured report: severity, type, line references, vulnerable snippets, and fix suggestions — in a Linear-inspired dark UI.

**Supported providers:** DeepSeek (recommended), Claude, GPT-4o, Gemini, and Groq.

---

## Features

### Core
- Multi-provider AI analysis (DeepSeek, Claude, GPT-4o, Gemini, Groq)
- Local **demo/mock mode** when no API keys are set (UI still fully testable)
- Detailed vulnerability reports with code snippets and fixes
- Syntax highlighting for vulnerable code and suggested fixes
- PDF export of scan reports
- Dashboard with stats and charts
- Scan history with filters and search

### Auth & Security
- JWT authentication with 7-day expiry
- bcrypt password hashing (10 rounds)
- Input validation with express-validator
- Parameterized SQL queries
- Rate limiting (general + strict on scans)
- Helmet security headers
- Strict CORS

### UI & Experience
- Premium dark UI (Linear-inspired)
- Split-screen login/register with particle background
- Theme switcher (Dark / Dim / Light)
- Collapsible sidebar with larger nav icons
- Count-up animations on stats
- Toast notifications and custom confirm dialogs (no browser `alert`/`confirm`)

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
| Icons       | lucide-vue-next                  |

**Fonts:** Bricolage Grotesque (headings) · DM Sans (body) · JetBrains Mono (code)

### Backend — `/server`
| Layer       | Library                          |
|-------------|----------------------------------|
| Runtime     | Node.js                          |
| Framework   | Express                          |
| Database    | MySQL (mysql2)                   |
| Auth        | jsonwebtoken + bcryptjs          |
| AI          | DeepSeek / OpenAI-compatible, Anthropic, OpenAI, Google Generative AI, Groq |
| Validation  | express-validator                |
| Security    | helmet, express-rate-limit       |

---

## Project Structure

```
codesentinel/
├── client/                 # Vue 3 frontend (Vite)
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB connection, env
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, rate limit
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI provider integrations
│   │   └── utils/
│   ├── scripts/            # DB init scripts
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
- MySQL 8+ (or MariaDB / XAMPP MySQL)
- Optional: API key for at least one AI provider (DeepSeek recommended)

### 1. Clone & Install

```bash
git clone https://github.com/moadh704/codesentinel.git
cd codesentinel

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your DB password and optional AI keys

# Frontend
cd ../client
npm install
```

> On Windows, if peer dependency warnings appear for `vue3-apexcharts`, use:
> `npm install --legacy-peer-deps`

### 2. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE codesentinel;"

# Run schema (includes deepseek / groq provider enum values)
mysql -u root -p codesentinel < server/scripts/init-db.sql
```

### 3. Run

**Option A — two terminals**

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

**Option B — Windows helper**

```bat
start-local.bat
```

Starts MySQL (if not already running via XAMPP), API on `:3000`, and UI on `:5173`, then opens the login page.

Open **http://127.0.0.1:5173** (prefer `127.0.0.1` over `localhost` if CORS or cookies misbehave).

### API keys (Settings UI or `.env`)

You can add keys in the app:

1. Log in → **Settings → AI Provider API Keys**
2. Paste DeepSeek / Claude / OpenAI / Gemini / Groq keys and **Save**
3. Run a **New Scan** with that provider

Keys stay in the browser (`localStorage`) and are sent only with authenticated scan requests (not stored in the database). If a Settings key is empty, the server falls back to `server/.env`. If neither is set for the chosen provider, scans run in **demo/mock mode**.

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

# AI Providers (at least one for real scans)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=

# CORS
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

Copy from `server/.env.example`. **Never commit** `server/.env`.

---

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT with 7-day expiry
- Rate limiting on all endpoints (strict on scans)
- Parameterized queries (no SQL injection)
- Helmet security headers
- Strict CORS
- Secrets and local debug artifacts are gitignored

---

## Development

The project was built step-by-step following a structured plan, then hardened for local Windows/XAMPP setups and multi-provider AI (including DeepSeek).

**License: Proprietary** — All rights reserved.

---

Built by [moadh704](https://github.com/moadh704) as a personal security tool and learning project.
