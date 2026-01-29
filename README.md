# AI Retail System (MVP)

This repository is intentionally split into phases.

## Phase 0 — Preparation

**Goal:** scaffold structure, configuration, and ingestible data so Phase 1 can start cleanly.

### What Phase 0 includes

- Mock product catalog data under `data/`
- Store policies (plain text + JSON) under `data/`
- Brand tone definition under `data/`
- Data that is ready for ingestion in later phases
- A minimal Next.js 13+ frontend page with Tailwind CSS

### What is intentionally NOT implemented yet

- No chatbot / conversation flows
- No recommendations, personalization, or shopping logic
- No AI chat / prompt execution in Phase 0
- No embeddings/vector search
- No auth, user accounts, carts, or payments
- No database migrations

## Repo layout

```
backend/
  app/
frontend/
data/
```

## Run locally

### Backend (Phase 1 — Core Backend + AI Brain)

From `backend`:

1) Create `backend/.env` from `.env.example`
2) Install deps: `pip install -r requirements.txt`
3) Load data (one-time):

- `python -m app.load_products`
- `python -m app.load_policies`

4) Run: `uvicorn app.main:app --reload --port 8000`

Swagger: `http://localhost:8000/docs`

Endpoint:

- `POST /chat` — answers using products + policies from DB

### Frontend (Next.js)

From `frontend`:

1) Install deps: `npm install`
2) Run: `npm run dev`

Open: `http://localhost:3000`

## Data

- `data/products/sample_catalog.csv` — broader mock catalog (Phase 0 preparation)
- `backend/data/denim_products.csv` — denim-focused CSV used for Phase 1 loading
- `backend/data/policies.csv` — policies used for Phase 1 loading
