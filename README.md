# DueDiligenceAI — Backend API

Production-grade company risk intelligence engine.  
FastAPI · Claude claude-sonnet-4-20250514 · NewsAPI · SerpAPI · SEC EDGAR · SSE streaming

---

## Architecture

```
POST /api/v1/analyze
        │
        ├── Parallel pre-fetch
        │       ├── NewsAPI  →  news sentiment + headlines
        │       └── SEC EDGAR →  10-K / 10-Q / enforcement filings
        │
        ├── Per-module loop (sequential, streamed)
        │       ├── SerpAPI  →  targeted Google search context
        │       └── Claude (web_search tool)  →  streaming analysis + risk score
        │
        ├── Overall risk synthesis  (Claude)
        │
        └── Persist report to disk (./reports/)
                └── GET /api/v1/reports/{id}
```

**SSE event flow:**
```
module_start → module_chunk (×N) → module_complete
    ... (repeat per module) ...
report_complete  →  [DONE]
```

---

## Quick Start

### 1. Install dependencies

```bash
cd due_diligence_api
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set ANTHROPIC_API_KEY
```

### 3. Run

```bash
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

---

## API Reference

### `POST /api/v1/analyze`

Start a due diligence analysis. Returns SSE stream.

**Request body:**
```json
{
  "company_name": "Byju's",
  "modules": ["overview", "financial", "legal", "reputation", "leadership", "cyber", "esg", "competitive"],
  "client_ref": "optional-your-client-id"
}
```

**Headers returned:**
- `X-Report-ID` — report UUID (available immediately, before stream completes)

**SSE events:**

| Event | Data |
|---|---|
| `module_start` | `{module, label}` |
| `module_chunk` | `{module, text, visible_text}` |
| `module_complete` | `{module, risk_score, risk_level, key_findings, duration_ms}` |
| `module_error` | `{module, error}` |
| `report_complete` | `{report_id, overall_risk, module_scores, report}` |

**Risk levels:** `low` (0–29) · `moderate` (30–54) · `high` (55–74) · `critical` (75–100)

---

### `GET /api/v1/reports`

List saved reports.

Query params: `company` (filter), `limit` (default 50)

---

### `GET /api/v1/reports/{report_id}`

Fetch a full report JSON.

---

### `DELETE /api/v1/reports/{report_id}`

Delete a report.

---

### `GET /health`

Health check.

---

## Frontend Integration

Copy `client.js` into your frontend:

```js
import { DueDiligenceClient } from "./client.js";

const dd = new DueDiligenceClient("https://your-api.com");

await dd.analyze("Apple Inc", ["overview", "financial", "legal"], {
  onModuleStart:    (module) => showSpinner(module),
  onChunk:          (module, text) => updateSection(module, text),
  onModuleComplete: (module, result) => showScore(module, result.risk_score),
  onReportComplete: (data) => showOverallVerdict(data.overall_risk),
  onError:          (err) => showError(err),
});
```

---

## Analysis Modules

| Module | What it covers |
|---|---|
| `overview` | Founding, structure, ownership, business model |
| `financial` | Revenue, funding, profitability, accounting flags |
| `legal` | Lawsuits, regulatory fines, enforcement actions |
| `reputation` | News sentiment, scandals, customer issues |
| `leadership` | CEO/board background, governance, insider issues |
| `cyber` | Data breaches, GDPR fines, security posture |
| `esg` | Environmental, labor, governance controversies |
| `competitive` | Market share, moat, disruption threats |

---

## Production Checklist

- [ ] Add API key auth middleware (replace `API_SECRET_KEY` with JWT or API key header check)
- [ ] Replace file-based `ReportStore` with PostgreSQL/MongoDB
- [ ] Add Redis for caching repeated company lookups
- [ ] Add rate limiting per user/IP (e.g. `slowapi`)
- [ ] Add request logging and tracing (OpenTelemetry)
- [ ] Run behind nginx/Caddy with TLS
- [ ] Set `ALLOWED_ORIGINS` to your actual frontend domain
- [ ] Add a job queue (Celery/ARQ) for long analyses if running many concurrently

---

## Data Sources

| Source | What it provides | Key |
|---|---|---|
| Claude claude-sonnet-4-20250514 + web_search | Primary AI analysis with live web | `ANTHROPIC_API_KEY` |
| NewsAPI | Recent news articles + sentiment | `NEWS_API_KEY` |
| SerpAPI | Google search results per module | `SERP_API_KEY` |
| SEC EDGAR | US public company filings (free) | Email in `SEC_EDGAR_USER_AGENT` |
