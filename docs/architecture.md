# Architecture

TRUEPLOT MVP is a Docker Compose monorepo with a Next.js frontend, FastAPI backend, and PostgreSQL database.

## Frontend Architecture

The frontend lives in `frontend/`.

Key parts:

- `app/`: Next.js App Router pages
- `components/`: reusable dashboard components
- `lib/api.ts`: backend API client
- `lib/auth.tsx`: local JWT auth provider
- `lib/types.ts`: shared frontend TypeScript API shapes
- `lib/format.ts`: display formatting helpers

Frontend routes:

- `/`: dashboard
- `/login`: login
- `/signup`: signup
- `/properties`: property listings
- `/properties/new`: create property
- `/properties/[id]`: property workspace
- `/agents`: agent listings
- `/agents/new`: agent onboarding
- `/agents/[id]`: agent detail
- `/admin`: moderation page

The frontend uses `NEXT_PUBLIC_API_BASE_URL` to call the backend.

Role-aware navigation and route guards are implemented in the frontend for local MVP flows. Backend authorization remains the source of truth for protected actions.

Frontend pricing intelligence:

- Property detail pages include an AI pricing panel.
- The panel renders sale or lease estimates based on the property listing type.
- It shows the estimate range, confidence score, pricing factors, market notes, and disclaimer.
- The generate CTA calls the backend pricing endpoint and saves the result to the property workspace state.

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
- `app/services/pricing_service.py`: AI-assisted fair market value placeholder logic
- `scripts/seed_db.py`: local sample data entrypoint

Auth modules:

- `app/api/routes/auth.py`: signup, login, current user
- `app/core/security.py`: bcrypt password hashing and JWT helpers
- `app/api/deps.py`: current-user and role dependencies

FastAPI automatically exposes:

- Swagger: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## PostgreSQL Design Overview

The database uses UUID primary keys and timestamp columns on major entities.

Core tables:

- `users`: local placeholder users
- user roles: `admin`, `seller`, `buyer`, `verified_agent`
- `properties`: sale, lease, and sale-or-lease listings
- `property_documents`: uploaded land document metadata
- `agents`: verified agent profiles
- `leads`: sample buyer/lessee interest records
- `lease_listings`: lease-specific listing data
- `ai_summaries`: AI-assisted document/property summary records
- `property_pricing_estimates`: AI-assisted sale and lease pricing placeholder records

Important relationships:

- A user owns many properties.
- A property can have many documents.
- A property can have many AI summaries.
- A property can have many pricing estimates.
- A document-generated AI summary links to both property and document.
- A verified agent can be assigned to many properties.

The current local MVP uses SQLAlchemy `create_all` plus idempotent local schema helpers. The structure is ready for Alembic migrations later, but migration files are not included yet.

## Authentication And Roles

The MVP uses local email/password signup, bcrypt password hashes, and bearer JWT access tokens. The seeded demo users cover the four supported roles: admin, seller, buyer, and verified agent.

Protected actions include:

- Admin-only listing approval and verification
- Admin-only agent approval
- Seller/admin property ownership updates
- Seller/admin document upload for owned properties
- Owner/admin/assigned-agent AI summary generation

## Document Upload Workflow

1. User opens a property workspace.
2. User uploads a document with a validated document type.
3. Backend validates that the property exists.
4. File is stored under `backend/uploads/`.
5. OCR extraction runs synchronously for PDF, JPG, and PNG uploads.
6. Extracted text, status, method, and errors are saved in `property_documents`.
7. Metadata is saved in `property_documents`.
8. Admin can update review status, verification status, and review notes.

Supported document types:

- EC
- 1B
- Adangal
- Sale deed
- Pattadar passbook
- FMB map
- Other

OCR notes:

- Tesseract is the primary local OCR engine.
- The pipeline falls back to mock extraction mode when the OCR toolchain is unavailable.
- The extracted text is stored on the document record and reused by AI summary generation.

## AI Summary Workflow

1. User selects an uploaded document.
2. Frontend calls `POST /documents/{document_id}/ai-summary`.
3. Backend validates the document and linked property.
4. OCR text from the uploaded document is passed into the summary prompt when available.
5. `ai_service.py` builds a local legal-summary placeholder.
6. If `OPENAI_API_KEY` is empty, the service runs in mock mode.
7. Summary is stored in `ai_summaries`.
8. Frontend displays English summary, Telugu summary, ownership summary, document insights, risk flags, next steps, and disclaimer.

All AI summary output is explicitly marked as preliminary and not final legal advice.

## AI Pricing Intelligence Workflow

1. User opens a property workspace.
2. User clicks Generate price estimate in the pricing panel.
3. Backend validates the property and authorizes the user.
4. `pricing_service.py` generates a deterministic local placeholder estimate.
5. The estimate supports both sale and lease listings.
6. The result is stored in `property_pricing_estimates`.
7. Frontend displays price range, confidence score, pricing factors, market notes, and disclaimer.

Pricing output fields:

- Estimated low and high amounts
- Confidence score
- Pricing factors
- District, mandal, and village influence
- Road/highway proximity placeholder
- Market notes
- AI-assisted valuation disclaimer

## Verified Agent Workflow

1. Agent profile is created from `/agents/new` or `POST /agents`.
2. Agent includes district, mandal, village, leasing, and NRI specialization fields.
3. Admin approves the agent.
4. Property workspace lists verified agents.
5. A verified agent can be assigned to or removed from a property.

Only verified agents can be assigned through the backend property-agent endpoint.

## Admin Moderation Workflow

The admin page is protected by the frontend route guard, and the backend requires the `admin` role for moderation actions.

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
