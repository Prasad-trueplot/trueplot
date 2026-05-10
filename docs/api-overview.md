# API Overview

Base URL:

```text
http://localhost:8000
```

Interactive docs:

```text
http://localhost:8000/docs
```

## Health API

```bash
curl http://localhost:8000/health
```

Response:

```json
{"status":"ok","service":"trueplot-backend"}
```

## Auth APIs

Endpoints:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

Signup:

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller-demo@example.com",
    "full_name": "Seller Demo",
    "phone": "+91-9000000000",
    "role": "seller",
    "password": "trueplot123"
  }'
```

Login:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trueplot.local","password":"trueplot123"}'
```

Use the returned `access_token` as a bearer token:

```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN"
```

## Property APIs

Endpoints:

- `POST /properties`
- `GET /properties`
- `GET /properties/{property_id}`
- `PATCH /properties/{property_id}`
- `PATCH /properties/{property_id}/status`
- `PATCH /properties/{property_id}/verification`
- `PATCH /properties/{property_id}/agent`

Create property:

```bash
curl -X POST http://localhost:8000/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN" \
  -d '{
    "owner_id": "REPLACE_WITH_USER_UUID",
    "title": "Verified Guntur land parcel",
    "description": "Demo listing",
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
    "is_verified": false,
    "state": "Andhra Pradesh"
  }'
```

List properties:

```bash
curl "http://localhost:8000/properties?district=Guntur&listing_type=lease"
```

Approve listing:

```bash
curl -X PATCH http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ADMIN_ACCESS_TOKEN" \
  -d '{"listing_status":"active"}'
```

Verify listing:

```bash
curl -X PATCH http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ADMIN_ACCESS_TOKEN" \
  -d '{"is_verified":true,"verification_status":"verified"}'
```

Assign verified agent:

```bash
curl -X PATCH http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ADMIN_ACCESS_TOKEN" \
  -d '{"agent_id":"REPLACE_WITH_VERIFIED_AGENT_UUID"}'
```

Remove agent:

```bash
curl -X PATCH http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ADMIN_ACCESS_TOKEN" \
  -d '{"agent_id":null}'
```

## Document APIs

Endpoints:

- `POST /properties/{property_id}/documents`
- `GET /properties/{property_id}/documents`
- `GET /documents/{document_id}`
- `PATCH /documents/{document_id}/review`

Upload document:

```bash
curl -X POST http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/documents \
  -H "Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN" \
  -F document_type=ec \
  -F notes="Initial EC upload" \
  -F file=@/path/to/ec.pdf
```

List property documents:

```bash
curl http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/documents
```

Review document:

```bash
curl -X PATCH http://localhost:8000/documents/REPLACE_WITH_DOCUMENT_UUID/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ADMIN_ACCESS_TOKEN" \
  -d '{
    "status": "approved",
    "is_verified": true,
    "admin_review_notes": "Reviewed for local MVP demo."
  }'
```

Document responses also include OCR fields:

- `ocr_extraction_status`
- `ocr_extraction_method`
- `extracted_text`
- `ocr_extraction_error`
- `ocr_extracted_at`

OCR notes:

- PDF and image uploads are processed locally with Tesseract-based OCR when available.
- Unsupported or unreadable files return a failed extraction status.
- Fallback mock extraction is used when the OCR toolchain is unavailable.

## AI Summary APIs

Endpoints:

- `POST /documents/{document_id}/ai-summary`
- `GET /properties/{property_id}/ai-summaries`
- `GET /ai-summaries/{summary_id}`

Generate AI-assisted document summary:

```bash
curl -X POST http://localhost:8000/documents/REPLACE_WITH_DOCUMENT_UUID/ai-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN" \
  -d '{}'
```

Response includes:

- `english_summary`
- `telugu_summary`
- `ownership_summary`
- `document_insights`
- `risk_flags`
- `recommended_next_steps`
- `disclaimer`
- `is_mock`

The output is for preliminary review only and is not final legal advice.

## Pricing Intelligence APIs

Endpoints:

- `POST /properties/{property_id}/pricing-estimate`
- `GET /properties/{property_id}/pricing-estimates`

Generate AI-assisted fair market value estimate:

```bash
curl -X POST http://localhost:8000/properties/REPLACE_WITH_PROPERTY_UUID/pricing-estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN" \
  -d '{}'
```

The response includes:

- `estimated_low_amount`
- `estimated_high_amount`
- `confidence_score`
- `pricing_factors`
- `district_influence`
- `mandal_influence`
- `village_influence`
- `road_highway_proximity`
- `market_notes`
- `disclaimer`
- `pricing_basis`
- `is_mock`

Pricing notes:

- Sale listings return a sale price range.
- Lease listings return a monthly lease range.
- Confidence score is a planning signal, not a valuation guarantee.
- Pricing factors explain the metadata used by the placeholder model.
- Disclaimer text must be shown as AI-assisted estimate only.

## Agent APIs

Endpoints:

- `POST /agents`
- `GET /agents`
- `GET /agents/{agent_id}`
- `PATCH /agents/{agent_id}`
- `PATCH /agents/{agent_id}/verification`

Create agent:

```bash
curl -X POST http://localhost:8000/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN" \
  -d '{
    "user_id": "REPLACE_WITH_USER_UUID",
    "license_number": "AP-AGENT-100",
    "agency_name": "Sample AP Realty",
    "service_area": "Guntur, NTR",
    "district_specialization": "Guntur",
    "mandal_specialization": "Tadepalli",
    "village_specialization": "Tadepalli",
    "supports_leasing": true,
    "supports_nri": true,
    "is_verified": false
  }'
```

Approve agent:

```bash
curl -X PATCH http://localhost:8000/agents/REPLACE_WITH_AGENT_UUID/verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_ADMIN_ACCESS_TOKEN" \
  -d '{"is_verified":true}'
```

List verified agents:

```bash
curl "http://localhost:8000/agents?verified_only=true"
```

## Admin Flows

Admin is a frontend workflow backed by property and agent endpoints.

Local UI:

```text
http://localhost:3000/admin
```

Admin actions:

- Approve listing: `PATCH /properties/{property_id}/status`
- Verify property: `PATCH /properties/{property_id}/verification`
- Approve agent: `PATCH /agents/{agent_id}/verification`

These endpoints require an admin bearer token.
