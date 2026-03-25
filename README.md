# MedTransparency

A crowdsourced healthcare pricing platform that lets patients compare real procedure costs, wait times, and outcomes across hospitals worldwide. Users can search and filter by procedure, country, budget, and outcome score — and submit their own anonymous data to help others make informed decisions.

An agentic AI is built in, backed by OpenRouter function-calling. It autonomously routes across 5 live database tools (procedure search, cost stats, regional comparison, hospital ranking, testimony retrieval) and returns verified, data-grounded answers — not generic internet advice.

---

## Features

- Search and compare procedure costs across 8 countries and 18 hospitals
- Filter by procedure, region, budget range, wait time, and sort order
- Outcome scores and cost range charts per hospital
- Anonymous patient data submission (multi-step form)
- JWT-based authentication with protected routes
- Agentic AI powered by OpenRouter function-calling
- Price alert system
- Region and procedure detail pages

---

## Tech Stack

### Frontend

|              |                         |
| ------------ | ----------------------- |
| Framework    | React 19 + TypeScript   |
| Build tool   | Vite                    |
| Styling      | Tailwind CSS v4         |
| Routing      | React Router v6         |
| Server state | TanStack React Query v5 |
| Global state | Zustand v5              |
| Forms        | React Hook Form + Zod   |
| Animations   | Framer Motion           |
| Charts       | Recharts                |
| HTTP client  | Axios                   |
| Icons        | Lucide React            |

### Backend

|               |                                   |
| ------------- | --------------------------------- |
| Framework     | FastAPI                           |
| Runtime       | Python 3.11+                      |
| ORM           | SQLAlchemy (async)                |
| Database      | SQLite + aiosqlite                |
| Auth          | JWT via python-jose + passlib     |
| AI            | OpenRouter API (function-calling) |
| Caching       | Redis                             |
| Rate limiting | SlowAPI                           |
| HTTP client   | httpx                             |

### Infrastructure

|                       |                         |
| --------------------- | ----------------------- |
| Containerisation      | Docker + Docker Compose |
| Web server (frontend) | Nginx                   |
| API server            | Uvicorn                 |

---

## Running Locally (without Docker)

### Prerequisites

- Python 3.11+
- Node.js 22+
- Redis (optional — search caching degrades gracefully without it)
- An [OpenRouter](https://openrouter.ai/) API key (required for the AI advisor)

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables section below)

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The database and tables are created automatically on first run. Seed data (12 procedures, 18 hospitals, 8 regions, 2,000+ submissions) is populated automatically if the database is empty.

API runs at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

Make sure the backend is running before starting the frontend.

---

## Running with Docker

The entire stack (frontend, backend, Redis) runs with a single command.

### Step 1 — Create the backend `.env` file

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the required values:

```env
DATABASE_URL=sqlite+aiosqlite:///./medtransparency.db
SECRET_KEY=your-secret-key-here          # generate with: openssl rand -hex 32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
REDIS_URL=redis://redis:6379             # keep this as-is for Docker
OPENROUTER_API_KEY=sk-or-v1-...         # required for AI advisor
OPENROUTER_MODEL=openai/gpt-4o-mini     # or any model on OpenRouter
CORS_ORIGINS=http://localhost:3000
```

### Step 2 — Build and start

```bash
docker compose up --build
```

| Service     | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:3000      |
| Backend API | http://localhost:8000      |
| API Docs    | http://localhost:8000/docs |
| Redis       | localhost:6379             |

To stop:

```bash
docker compose down
```

To stop and remove volumes (clears Redis cache):

```bash
docker compose down -v
```

---

## Environment Variables

All variables go in `backend/.env`. The only required one to change for core functionality is `OPENROUTER_API_KEY` — everything else has sensible defaults.

| Variable                      | Required     | Description                                            |
| ----------------------------- | ------------ | ------------------------------------------------------ |
| `DATABASE_URL`                | Yes          | SQLite connection string                               |
| `SECRET_KEY`                  | Yes          | JWT signing key — change in production                 |
| `ALGORITHM`                   | No           | JWT algorithm (default: HS256)                         |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No           | Access token TTL (default: 30)                         |
| `REFRESH_TOKEN_EXPIRE_DAYS`   | No           | Refresh token TTL (default: 7)                         |
| `REDIS_URL`                   | No           | Redis connection URL — caching disabled if unreachable |
| `OPENROUTER_API_KEY`          | Yes (for AI) | Get one at openrouter.ai                               |
| `OPENROUTER_MODEL`            | No           | Any OpenRouter model ID (default: openai/gpt-4o-mini)  |
| `CORS_ORIGINS`                | No           | Comma-separated allowed origins                        |

---

## Project Structure

```
medtransparency/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlers
│   │   ├── core/               # Config, database, security, cache
│   │   ├── models/             # SQLAlchemy models
│   │   ├── repositories/       # DB access layer
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic + AI agent
│   │   ├── tools/              # OpenRouter tool definitions
│   │   └── main.py
│   ├── seed_data.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios API clients
│   │   ├── components/         # UI, layout, search, charts, AI
│   │   ├── pages/              # Route-level page components
│   │   ├── store/              # Zustand stores
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/
│   └── Dockerfile
└── docker-compose.yml
```
