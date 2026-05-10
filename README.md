# TRUEPLOT MVP

TRUEPLOT is a local MVP for an AI-assisted, verified real estate transaction workflow focused on Andhra Pradesh land and property records.

The project demonstrates how property listings, uploaded land documents, AI-assisted legal summaries, verified agents, and admin moderation can work together in a simple local environment. It is built for founder demos, co-founder review, investor walkthroughs, and future developer onboarding.

## Project Overview

TRUEPLOT helps model a verified property transaction workflow around:

- AP land and property listings
- EC, 1B, Adangal, sale deed, Pattadar passbook, FMB map, and other document uploads
- AI-assisted legal summary placeholders
- Listing approval and verification
- Verified agent onboarding and property assignment
- Local PostgreSQL-backed data persistence

The MVP is intentionally local-first. It does not include authentication, payments, real OCR, production AI calls, KYC providers, government API integrations, or production deployment infrastructure.

## Architecture Overview

```text
frontend/   Next.js, TypeScript, Tailwind CSS
backend/    FastAPI, SQLAlchemy, Pydantic, local file uploads
postgres    PostgreSQL database via Docker Compose
docs/       Architecture, API, demo flow, roadmap, developer setup
infra/      Local infrastructure notes
```

Runtime architecture:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger/OpenAPI: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## MVP Scope

Implemented:

- Property listing dashboard
- Create, list, view, approve, and verify properties
- Sale, lease, and sale-or-lease listing types
- AP location fields: district, mandal, village, survey number
- Local document upload and metadata storage
- AI legal summary placeholder with mock mode
- English and Telugu summary fields
- Risk flags, ownership summary, document insights, next steps, and disclaimer
- Verified agent onboarding
- Agent approval and property assignment
- Admin moderation screens
- Docker Compose local development stack

Not included:

- Authentication or production role-based access
- Payment flows
- Real OCR or document parsing
- Final legal advice
- Real KYC provider integration
- Government, bank, GIS, or blockchain integrations
- Production Kubernetes, CI/CD, or observability
- Mobile apps

## Local Setup

Prerequisites:

- Docker Desktop with Docker Compose
- Node.js 22+ and npm, only for running frontend outside Docker
- Python 3.12+, only for running backend outside Docker

Start all services:

```bash
docker compose up --build
```

Seed sample data:

```bash
docker compose exec backend python -m scripts.seed_db
```

Stop services:

```bash
docker compose down
```

Reset database volume:

```bash
docker compose down -v
docker compose up --build
docker compose exec backend python -m scripts.seed_db
```

## URLs

Frontend:

- Dashboard: `http://localhost:3000`
- Listings: `http://localhost:3000/properties`
- Create listing: `http://localhost:3000/properties/new`
- Property workspace: `http://localhost:3000/properties/{property_id}`
- Agents: `http://localhost:3000/agents`
- Agent onboarding: `http://localhost:3000/agents/new`
- Admin moderation: `http://localhost:3000/admin`

Backend:

- Health: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

Database:

- Host: `localhost`
- Port: `5432`
- Database: `trueplot`
- User: `trueplot_user`
- Password: `trueplot_pass`

## Environment Variables

Root `.env.example`:

```text
COMPOSE_PROJECT_NAME=trueplot_mvp
```

Frontend:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Backend:

```text
APP_ENV=local
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql+psycopg://trueplot_user:trueplot_pass@localhost:5432/trueplot
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

When `OPENAI_API_KEY` is empty, AI summaries run in local mock mode.

## Sample Workflows

Property workflow:

1. Open `http://localhost:3000/properties/new`.
2. Create a property with AP location fields.
3. Open the property workspace.
4. Upload an EC, 1B, Adangal, sale deed, passbook, FMB map, or other document.
5. Generate an AI-assisted legal summary.
6. Use admin actions to approve and verify the listing.
7. Assign a verified agent.

Admin workflow:

1. Open `http://localhost:3000/admin`.
2. Approve pending or draft listings.
3. Mark properties as verified.
4. Approve pending agents.

Agent workflow:

1. Open `http://localhost:3000/agents/new`.
2. Create an agent profile with district, mandal, village, leasing, and NRI specialization.
3. Approve the agent from the admin page or agent detail page.
4. Assign the verified agent from a property workspace.

## Common Commands

```bash
make up
make down
make logs
make frontend
make backend
```

Direct validation:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/properties
curl http://localhost:8000/agents
```

Frontend checks:

```bash
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run build
```

Backend syntax check:

```bash
env PYTHONPYCACHEPREFIX=/private/tmp/trueplot_pycache python3 -m compileall backend/app backend/scripts
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Overview](docs/api-overview.md)
- [MVP Demo Flow](docs/mvp-demo-flow.md)
- [Developer Setup](docs/developer-setup.md)
- [Roadmap](docs/roadmap.md)

## Troubleshooting

- If `docker` is not found, install and start Docker Desktop, then reopen the terminal.
- If ports `3000`, `8000`, or `5432` are in use, stop the conflicting service or change `docker-compose.yml`.
- If frontend routes return unexpected dev-server errors after a build, run `docker compose restart frontend`.
- If the frontend cannot reach the backend, confirm `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- If uploads fail, confirm `python-multipart` is installed in the backend image by rebuilding: `docker compose build backend`.
- If database schema looks stale, run the local schema setup or reset the volume.

## Future Roadmap

Planned future phases include OCR, stronger Telugu AI support, authentication, payments, leasing intelligence, GIS integrations, bank integrations, production Kubernetes, observability, and mobile apps. See [docs/roadmap.md](docs/roadmap.md).

## MVP Limitations

This MVP is a local prototype. AI summaries are placeholders for review, not legal advice. Uploaded files are stored locally. Admin actions do not enforce real authentication. The database setup is migration-ready but does not yet include Alembic migration files.
