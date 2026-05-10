# TRUEPLOT Backend

FastAPI application for the TRUEPLOT MVP local development foundation.

Run locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Health endpoint:

```text
GET /health
```

## Database Models

The local MVP database layer includes SQLAlchemy models for:

- `users`
- `agents`
- `properties`
- `property_documents`
- `leads`
- `lease_listings`
- `ai_summaries`

Model metadata is centralized in `app.db.base.Base` with stable constraint names for future migrations.

Create local development tables:

```bash
docker compose exec backend python -c "from app.db.init_db import create_database_tables; create_database_tables()"
```

Seed sample data:

```bash
docker compose exec backend python -m scripts.seed_db
```

Verify tables:

```bash
docker compose exec postgres psql -U trueplot_user -d trueplot -c "\dt"
```

## Property Listing API

Swagger docs:

```text
http://localhost:8000/docs
```

Create a property:

```bash
curl -X POST http://localhost:8000/properties \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "REPLACE_WITH_USER_UUID",
    "title": "Verified land parcel",
    "property_type": "land",
    "listing_type": "sale_or_lease",
    "district": "Guntur",
    "mandal": "Tadepalli",
    "village": "Tadepalli",
    "survey_number": "123/4A",
    "latitude": 16.4777,
    "longitude": 80.6186,
    "extent_sq_yards": 2400,
    "listing_status": "draft",
    "verification_status": "pending",
    "is_verified": false
  }'
```

List properties:

```bash
curl "http://localhost:8000/properties?district=Guntur&listing_type=sale_or_lease"
```

Get property details:

```bash
curl http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID
```

Update listing status:

```bash
curl -X PATCH http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/status \
  -H "Content-Type: application/json" \
  -d '{"listing_status":"active"}'
```

Update verification:

```bash
curl -X PATCH http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/verification \
  -H "Content-Type: application/json" \
  -d '{"is_verified":true,"verification_status":"verified"}'
```

## Document Upload API

Supported `document_type` values:

- `ec`
- `1b`
- `adangal`
- `sale_deed`
- `pattadar_passbook`
- `fmb_map`
- `other`

Upload a property document:

```bash
curl -X POST http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/documents \
  -F document_type=sale_deed \
  -F notes="Initial local MVP upload" \
  -F file=@/path/to/document.pdf
```

List property documents:

```bash
curl http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/documents
```

Get document details:

```bash
curl http://localhost:8000/documents/REPLACE_WITH_DOCUMENT_UUID
```

Update document review status:

```bash
curl -X PATCH http://localhost:8000/documents/REPLACE_WITH_DOCUMENT_UUID/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "is_verified": true,
    "admin_review_notes": "Reviewed against local MVP checklist."
  }'
```

Uploaded files are stored locally under:

```text
backend/uploads/
```

## AI Legal Summary Placeholder API

This local MVP workflow generates AI-assisted summaries for uploaded documents and stores them in `ai_summaries`.

The output is explicitly for preliminary human review only. It is not final legal advice.

Mock mode is used automatically when `OPENAI_API_KEY` is not set:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Generate a summary for an uploaded document:

```bash
curl -X POST http://localhost:8000/documents/REPLACE_WITH_DOCUMENT_UUID/ai-summary \
  -H "Content-Type: application/json" \
  -d '{}'
```

List summaries for a property:

```bash
curl http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/ai-summaries
```

Get summary details:

```bash
curl http://localhost:8000/ai-summaries/REPLACE_WITH_SUMMARY_UUID
```

Summary responses include:

- `english_summary`
- `telugu_summary`
- `ownership_summary`
- `document_insights`
- `risk_flags`
- `recommended_next_steps`
- `disclaimer`
- `is_mock`
