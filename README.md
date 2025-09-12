# MedTransparency

Crowdsourced healthcare pricing platform — compare real procedure costs, wait times, and outcomes across hospitals worldwide.

## Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **AI**: OpenRouter function-calling (agentic AI advisor)
- **Infra**: Docker Compose, Redis

## Getting Started

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```
