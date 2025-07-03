# i-WMS Backend (FastAPI + LangChain RAG)

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Endpoints

- `POST /api/analyze-excel` — Upload Excel file, get structured JSON (shift/hourly analysis)
- `POST /api/vectorize` — Upload document, chunk/embed/store in ChromaDB
- `POST /api/query` — Ask a question, get RAG answer from LLM (with citations)

## Security
- Set `API_KEY` in `.env` to require Bearer token on all endpoints.

## Integration
- Frontend should POST to these endpoints (see `lib/ai.ts` in the Next.js app)
- Set `NEXT_PUBLIC_AI_BACKEND_URL` in your frontend to point to `/api/query` endpoint

## Notes
- Uses OpenAI by default, but can be swapped for Ollama, Gemini, etc. in `llm_chain.py`
- Vector store is ChromaDB (local, persistent)
- Excel analysis expects columns: `Pallets`, `Shift`, `Hour` 