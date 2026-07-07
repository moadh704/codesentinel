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
  <img src="https://img.shields.io/badge/AI_Powered-7C5CFF?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<br/>

</div>

---

## What is CodeSentinel?

CodeSentinel is a full-stack AI-powered security code reviewer that helps developers identify vulnerabilities before they reach production.

Analyze code using Claude, GPT-4o, or Gemini. Receive detailed reports with severity ratings, line references, descriptions, and fix suggestions — all in a premium, Linear.app-inspired interface.

---

## Features

### Core
- Multi-provider AI analysis (Claude, GPT-4o, Gemini)
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
- Collapsible sidebar
- Count-up animations on stats
- Toast notifications and confirm dialogs

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
| AI          | Anthropic, OpenAI, Google Generative AI |
| Validation  | express-validator                |
| Security    | helmet, express-rate-limit       |

---

## Project Structure

```
codesentinel/
├── client/                 # Vue 3 frontend (Vite)
├── server/                 # Express backend
│   ├── src/
│   ├── config/         # DB connection, env
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, validation, rate limit
│   ├── routes/         # API routes
│   ├── services/       # AI provider integrations
│   └── utils/
│   ├── scripts/            # DB init scripts
│   ├── package.json
│   └── .env.example
├── DESIGN.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+
- API keys for at least one AI provider (Anthropic / OpenAI / Google)

### 1. Clone & Install

```bash
git clone https://github.com/moadh704/codesentinel.git
cd codesentinel

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../client
npm install
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE codesentinel;"

# Run schema
mysql -u root -p codesentinel < server/scripts/init-db.sql
```

### 3. Run

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Open http://localhost:5173

---

## Environment Variables (server/.env)

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

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
```

---

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT with 7-day expiry
- Rate limiting on all endpoints (strict on scans)
- Parameterized queries (no SQL injection)
- Helmet security headers
- Strict CORS

---

## Development

The project was built step-by-step following a structured 11-step plan.

License: MIT

---

Built by moadh704 as a personal security tool and learning project.