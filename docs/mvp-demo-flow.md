# MVP Demo Flow

This flow is designed for founder, co-founder, and investor review on a local machine.

## Before Demo

Start the stack:

```bash
docker compose up --build
```

Seed data:

```bash
docker compose exec backend python -m scripts.seed_db
```

Open:

```text
http://localhost:3000
```

Demo logins use password `trueplot123`:

- Admin: `admin@trueplot.local`
- Seller: `owner@example.com`
- Verified agent: `agent@example.com`
- Buyer: `buyer@example.com`

## 1. Create Property

1. Log in as `owner@example.com`.
2. Go to `/properties/new`.
3. Use the prefilled owner UUID.
4. Enter AP location details:
   - District
   - Mandal
   - Village
   - Survey number
5. Choose sale, lease, or sale-or-lease.
6. Submit the listing.

Expected result:

- New listing is created as `draft`.
- Verification status is `pending`.
- User is redirected to the property workspace.

## 2. Upload EC or 1B

1. Open the property workspace.
2. In Document Upload, choose `EC` or `1B`.
3. Select a local file.
4. Add optional notes.
5. Upload.

Expected result:

- File is stored under `backend/uploads/`.
- Metadata appears in the property document list.

## 3. Generate AI Summary

1. From the uploaded document row, click Generate AI summary.
2. Wait for the mock summary.

Expected result:

- Summary appears in the AI legal summary section.
- English and Telugu fields are shown.
- Risk flags and next steps are shown.
- Disclaimer says the output is not final legal advice.

## 4. Approve Listing

1. Open `/admin` or use Admin Actions on the property workspace.
2. Log in as `admin@trueplot.local` if needed.
3. Click Approve for the listing.

Expected result:

- Listing status changes to `active`.

## 5. Verify Listing

1. Open `/admin` or use Admin Actions on the property workspace.
2. Log in as `admin@trueplot.local` if needed.
3. Click Verify.

Expected result:

- `is_verified` becomes true.
- Verification status changes to `verified`.

## 6. Assign Verified Agent

1. Go to `/agents`.
2. Confirm at least one agent is verified.
3. Open a property workspace.
4. Log in as `admin@trueplot.local`.
5. Use the Verified Agent panel.
6. Select a verified agent and assign.

Expected result:

- Property displays assigned agent details.
- Backend rejects unverified agents.

## 7. Buyer Viewing Flow

1. Go to `/properties`.
2. Search by district, mandal, village, or survey number.
3. Open a listing.
4. Review verification status, listing status, documents, AI summary, risk flags, and assigned agent.

Expected result:

- Buyer-facing review context is visible.
- The MVP demonstrates the verified workflow with simple local role-based authentication and without payment complexity.
