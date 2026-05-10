# Developer Setup

## Prerequisites

- Docker Desktop
- Docker Compose
- Node.js 22+ and npm for non-Docker frontend development
- Python 3.12+ for non-Docker backend development

Check Docker:

```bash
docker --version
docker compose version
```

## Start Local Stack

From the repository root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

## Seed Local Data

```bash
docker compose exec backend python -m scripts.seed_db
```

The seed script is idempotent and can be run more than once.

## Common Commands

```bash
make up
make down
make logs
make frontend
make backend
```

Docker equivalents:

```bash
docker compose up --build
docker compose down
docker compose logs -f
docker compose restart frontend
docker compose restart backend
```

## Frontend Development

Inside Docker:

```bash
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run build
```

Outside Docker:

```bash
cd frontend
npm install
npm run dev
```

Frontend environment:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Backend Development

Inside Docker:

```bash
docker compose exec backend python -m scripts.seed_db
```

Outside Docker:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend environment:

```text
DATABASE_URL=postgresql+psycopg://trueplot_user:trueplot_pass@localhost:5432/trueplot
FRONTEND_ORIGIN=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

## Database

Open psql:

```bash
docker compose exec postgres psql -U trueplot_user -d trueplot
```

List tables:

```bash
docker compose exec postgres psql -U trueplot_user -d trueplot -c "\dt"
```

Reset database:

```bash
docker compose down -v
docker compose up --build
docker compose exec backend python -m scripts.seed_db
```

## Rebuild Instructions

Rebuild everything:

```bash
docker compose up --build
```

Rebuild backend after dependency changes:

```bash
docker compose build backend
docker compose up -d backend
```

Rebuild frontend after dependency changes:

```bash
docker compose build frontend
docker compose up -d frontend
```

If `next build` runs while `next dev` is active, restart the frontend dev server:

```bash
docker compose restart frontend
```

## Common Errors

Docker socket permission denied:

```text
permission denied while trying to connect to the docker API
```

Fix:

- Start Docker Desktop.
- Confirm Docker is available with `docker --version`.
- Retry the command.

Port already in use:

```text
bind: address already in use
```

Fix:

- Stop the conflicting process.
- Or change port mappings in `docker-compose.yml`.

Frontend cannot reach backend:

Fix:

- Confirm backend health: `curl http://localhost:8000/health`.
- Confirm frontend env: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.

Upload endpoint fails:

Fix:

- Rebuild backend so `python-multipart` is installed.

```bash
docker compose build backend
docker compose up -d backend
```

Database schema stale:

Fix:

```bash
docker compose exec backend python -c "from app.db.init_db import create_database_tables; create_database_tables()"
```

