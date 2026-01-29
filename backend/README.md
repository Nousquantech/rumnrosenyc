# Backend (Phase 1 — Core Backend + AI Brain)

Scope: backend only. No frontend.

## What’s included

- PostgreSQL connection via SQLAlchemy ORM
- `Product` and `Policy` models
- One-time CSV loaders using pandas
- AI engine wrapper (OpenAI-compatible)
- `POST /chat` endpoint

## Phase 2 (Embeddings + Retrieval)

- Chroma vector store persisted on disk
- One-time embedding scripts for products and policies
- `/chat` retrieves only top-K relevant items (no full-table prompt)

## What’s intentionally NOT included

- No auth
- No embeddings / vector search
- No recommendations beyond available products
- No UI

## Setup

1) Create `backend/.env` (copy from `.env.example`)
2) Install dependencies
3) Load products + policies (one-time)
4) Run the API

### Install

From `backend`:

`pip install -r requirements.txt`

### Load data (one-time)

From `backend`:

- `python -m app.load_products`
- `python -m app.load_policies`

### Create embeddings (one-time, safe to re-run)

From `backend`:

- `python -m app.embed_products`
- `python -m app.embed_policies`

### Run API

From `backend`:

`uvicorn app.main:app --reload --port 8000`

Swagger: `http://localhost:8000/docs`

## Notes

- If you haven’t run the embedding scripts yet, retrieval will return no results and `/chat` will respond with: `I don’t have enough information.`

