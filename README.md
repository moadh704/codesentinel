# CodeSentinel

> AI-powered security code reviewer. Analyze code for vulnerabilities using Claude, GPT-4, or Gemini. Built with Vue 3 + Express + MySQL.

**Full-stack application** following OWASP-inspired analysis, premium Linear.app-like dark UI, and strict security practices.

## Features

- 🔐 JWT Authentication (register, login, password change)
- 🤖 Multi-provider AI analysis (Claude Sonnet 4, GPT-4o, Gemini 1.5 Pro)
- 📊 Dashboard with stats, charts (scans per day, severity breakdown)
- 🔍 Detailed vulnerability reports with syntax-highlighted snippets
- 📄 PDF export of reports
- 📜 Scan history with filters & search
- ⚙️ User settings: profile, API key overrides, theme & accent picker
- 🛡️ Hardened backend: Helmet, rate limiting, input validation, parameterized queries

## Tech Stack

**Frontend**
- Vue 3 + Vite + Vue Router + Pinia
- Tailwind CSS + shadcn-vue
- ApexCharts, shiki (code highlight), pdfmake, lucide-vue-next
- Three.js / Canvas for particle login background

**Backend**
- Node.js + Express
- MySQL (mysql2)
- JWT + bcryptjs
- Anthropic SDK, OpenAI SDK, Google Generative AI
- pdfmake (optional server-side)

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
│   │   ├── utils/
│   ├── scripts/            # DB init scripts
│   ├── package.json
│   ├── .env.example
├── DESIGN.md
├── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+ (or Docker)
- API keys for at least one provider (Anthropic / OpenAI / Google AI Studio)

### 1. Clone & Install

```bash
git clone https://github.com/moadh704/codesentinel.git
cd codesentinel

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your DB creds and AI keys

# Frontend
cd ../client
npm install
```

### 2. Database Setup

```bash
# In MySQL
CREATE DATABASE codesentinel;

# Then run the schema
mysql -u root -p codesentinel < ../server/scripts/init-db.sql
```

Or use the provided SQL in `server/scripts/init-db.sql`.

### 3. Run

```bash
# Terminal 1: Backend (dev with nodemon)
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` (frontend) and backend on `http://localhost:3000`.

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

# AI Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

See `server/src/routes/` for full list. All protected routes require `Authorization: Bearer <token>`.

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT 7-day expiry
- Rate limiting on sensitive endpoints
- Parameterized queries only
- Helmet.js headers
- CORS locked to frontend URL
- Never log API keys

## Development Roadmap

Follows the 11-step build plan documented in conversation history.

## License

MIT — feel free to use and improve.

## Author

Built by moadh704 as a personal project + learning exercise in secure full-stack development.

---

**Ready to review code like a senior security engineer.**
