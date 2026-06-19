# VeriRisk Terminal

**Production-grade institutional forensic risk intelligence engine.**

VeriRisk Terminal is a full-stack fintech application that conducts AI-powered forensic audits across multiple risk modules, streaming real-time analysis results to a Bloomberg Terminal-style dark UI.

---

## Architecture

- **Backend:** FastAPI (Python), Google Gemini 2.0 Flash (`google-genai`), SSE streaming.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion.

The backend processes an audit sequentially through 5 core modules:
1. **Solvency:** Cash position, debt load, liquidity ratios.
2. **Earnings Quality:** Revenue recognition, margin trends, working capital.
3. **Governance:** Board structure, insider transactions, auditor flags.
4. **Legal & Regulatory:** Litigation, fines, enforcement actions.
5. **Market Position:** Competitive moat, customer concentration, sector risk.

---

## Setup Instructions

### 1. Backend

```text
# Ensure Python 3.10+
pip install -r requirements.txt

# Create your .env file
cp .env.example .env

# Start the server (runs on port 8008)
python main.py
```

### 2. Frontend

```text
# Install Node dependencies
npm install

# Start the Vite development server
npm run build && npm run preview
```

---

## API Reference

### `POST /api/v1/analyze`
Initiates a due diligence analysis. Returns an SSE stream.
- **Request body:** `{"company_name": "Apple Inc"}`
- **SSE Events:**
  - `module_start` — signals the start of a module.
  - `chunk` — streams analytical text for the current module.
  - `module_complete` — signals module completion with its score.
  - `report_complete` — final structured JSON containing `overall_risk`, `metrics`, `chartData`, `key_findings`, and `verdict`.
  - `[DONE]` — indicates the stream has successfully finished.

### `GET /api/v1/health`
Health check endpoint.
- Returns: `{"status": "ok", "model": "gemini-2.0-flash", "version": "3.1"}`

### `GET /api/v1/reports`
Fetches a list of the last 10 completed forensic analyses stored in memory.

---

## Environment Variables
The `.env` file must include:
- `GEMINI_API_KEY`: Your valid Google Gemini API Key.
- `ALLOWED_ORIGINS`: Origins allowed to interact with the backend.
- `PORT`: Server port (default `8008`).
