# Architecture

TRUEPLOT MVP is a Docker Compose monorepo with a Next.js frontend, FastAPI backend, and PostgreSQL database.

## Frontend Architecture

The frontend lives in `frontend/`.

Key parts:

- `app/`: Next.js App Router pages
- `components/`: reusable dashboard components
- `lib/api.ts`: backend API client
- `lib/types.ts`: shared frontend TypeScript API shapes
- `lib/format.ts`: display formatting helpers

Frontend routes:

- `/`: dashboard
- `/properties`: property listings
- `/properties/new`: create property
- `/properties/[id]`: property workspace
- `/agents`: agent listings
- `/agents/new`: agent onboarding
- `/agents/[id]`: agent detail
- `/admin`: moderation page

The frontend uses `NEXT_PUBLIC_API_BASE_URL` to call the backend.

## Backend Architecture

The backend lives in `backend/`.

Key parts:

- `app/main.py`: FastAPI app setup, CORS, route registration
- `app/api/routes/`: modular API routes
- `app/models/`: SQLAlchemy models
- `app/schemas/`: Pydantic request/response schemas
- `app/crud/`: CRUD utilities
- `app/db/`: database session, metadata, local schema setup, seed data
- `app/services/`: upload storage and AI summary placeholder services
- `scripts/seed_db.py`: local sample data entrypoint

FastAPI automatically exposes:

- Swagger: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## PostgreSQL Design Overview

The database uses UUID primary keys and timestamp columns on major entities.

Core tables:

- `users`: local placeholder users
- `properties`: sale, lease, and sale-or-lease listings
- `property_documents`: uploaded land document metadata
- `agents`: verified agent profiles
- `leads`: sample buyer/lessee interest records
- `lease_listings`: lease-specific listing data
- `ai_summaries`: AI-assisted document/property summary records

Important relationships:

- A user owns many properties.
- A property can have many documents.
- A property can have many AI summaries.
- A document-generated AI summary links to both property and document.
- A verified agent can be assigned to many properties.

The current local MVP uses SQLAlchemy `create_all` plus idempotent local schema helpers. The structure is ready for Alembic migrations later, but migration files are not included yet.

## Document Upload Workflow

1. User opens a property workspace.
2. User uploads a document with a validated document type.
3. Backend validates that the property exists.
4. File is stored under `backend/uploads/`.
5. Metadata is saved in `property_documents`.
6. Admin can update review status, verification status, and review notes.

Supported document types:

- EC
- 1B
- Adangal
- Sale deed
- Pattadar passbook
- FMB map
- Other

## AI Summary Workflow

1. User selects an uploaded document.
2. Frontend calls `POST /documents/{document_id}/ai-summary`.
3. Backend validates the document and linked property.
4. `ai_service.py` builds a local legal-summary placeholder.
5. If `OPENAI_API_KEY` is empty, the service runs in mock mode.
6. Summary is stored in `ai_summaries`.
7. Frontend displays English summary, Telugu summary, ownership summary, document insights, risk flags, next steps, and disclaimer.

All AI summary output is explicitly marked as preliminary and not final legal advice.

## Verified Agent Workflow

1. Agent profile is created from `/agents/new` or `POST /agents`.
2. Agent includes district, mandal, village, leasing, and NRI specialization fields.
3. Admin approves the agent.
4. Property workspace lists verified agents.
5. A verified agent can be assigned to or removed from a property.

Only verified agents can be assigned through the backend property-agent endpoint.

## Admin Moderation Workflow

The admin page is local MVP only and has no authentication.

It supports:

- Listing approval
- Property verification
- Agent approval

The backend enforces valid status enums and verified-agent assignment rules, but production authorization is not implemented.

## Local Docker Architecture

`docker-compose.yml` defines:

- `frontend`: Next.js dev server on port `3000`
- `backend`: FastAPI/Uvicorn on port `8000`
- `postgres`: PostgreSQL on port `5432`

Named volumes:

- `frontend_node_modules`
- `frontend_next`
- `postgres_data`

Local uploads are bind-mounted from `backend/uploads/`.

