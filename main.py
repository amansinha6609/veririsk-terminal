import os
import json
import traceback
import uuid
import random
import asyncio
import re
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from utils.config import settings

# --- 1. CONFIGURATION & ENVIRONMENT ---
load_dotenv()

USE_MOCK = os.getenv("USE_MOCK_GEMINI", "false").lower() == "true"

client = None
if not USE_MOCK:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

app = FastAPI(title="Veririsk Forensic Terminal v3.1")

# Standard CORS setup to allow your React frontend to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. ENGINE INITIALIZATION ---
MODEL_ID = 'gemini-2.0-flash'

# In-memory store for reports
reports_store = []

MODULES = [
    {"id": "solvency", "label": "Solvency Analysis", "description": "Cash position, debt load, liquidity ratios"},
    {"id": "earnings_quality", "label": "Earnings Quality", "description": "Revenue recognition, margin trends, working capital"},
    {"id": "governance", "label": "Governance", "description": "Board structure, insider transactions, auditor flags"},
    {"id": "legal_regulatory", "label": "Legal & Regulatory", "description": "Litigation, fines, enforcement actions"},
    {"id": "market_position", "label": "Market Position", "description": "Competitive moat, customer concentration, sector risk"}
]

# Define structured JSON output schema
class ReportMetrics(BaseModel):
    final_score: int = Field(description="Integer 1-99 representing overall risk")
    risk_level: str = Field(description="LOW, MODERATE, HIGH, or CRITICAL")
    debt_to_equity: float
    current_ratio: float
    altman_z_score: float
    interest_coverage: float
    key_findings: list[str] = Field(description="Exactly 3 key findings strings")
    verdict: str = Field(description="One sentence summary string")

def generate_solvency_chart(debt_to_equity, score):
    base_debt = debt_to_equity * 10

    chart_data = []
    current_debt = base_debt
    current_cash = 25 if score < 30 else (5 if score > 70 else 15)

    for q in ["Q1", "Q2", "Q3", "Q4"]:
        variance = random.uniform(-0.10, 0.10)

        if score > 55:
            current_debt = current_debt * (1 + 0.05 + variance)
            current_cash = max(5, current_cash * (1 - 0.05 + variance))
        elif score < 30:
            current_debt = current_debt * (1 + variance)
            current_cash = min(25, current_cash * (1 + 0.02 + variance))
        else:
            current_debt = current_debt * (1 + variance)
            current_cash = current_cash * (1 + variance)

        chart_data.append({
            "quarter": q,
            "debt": round(current_debt, 1),
            "cash": round(current_cash, 1)
        })

    return chart_data

def generate_velocity_chart(score, key_findings):
    points = ["T-90", "T-60", "T-30", "NOW"]
    chart_data = []

    if score > 70:
        risks = [max(1, score - 25), max(1, score - 10), score, min(99, score + 5)]
    elif score < 40:
        risks = [min(99, score + 10), min(99, score + 5), score, max(1, score - 2)]
    else:
        risks = []
        base = score
        for _ in range(4):
            variance = random.uniform(-8, 8)
            risks.append(max(1, min(99, round(base + variance))))
        risks[-1] = score # Ensure NOW is the final score

    for i, p in enumerate(points):
        # We try to add an anchor text from key findings for points T-60 and T-30 if available
        point_data = {"time": p, "risk": round(risks[i])}
        if i == 1 and len(key_findings) > 0:
             point_data["anchor"] = key_findings[0][:30] + "..."
        if i == 2 and len(key_findings) > 1:
             point_data["anchor"] = key_findings[1][:30] + "..."

        chart_data.append(point_data)

    return chart_data

# --- 3. FORENSIC AUDIT LOGIC ---
async def forensic_audit_generator(company_name: str):
    full_narrative = ""
    try:
        if USE_MOCK:
            from tests.mock_gemini import MOCK_MODULE_RESPONSES, MOCK_FINAL_JSON
            # stream mock module responses with artificial delay
            for mod in MODULES:
                module_key = mod['id']
                module_label = mod['label']
                yield f"data: {json.dumps({'type': 'module_start', 'module': module_key, 'label': module_label})}\n\n"
                mock_text = MOCK_MODULE_RESPONSES.get(module_key, "Analysis complete.")
                # stream in chunks of ~80 chars to simulate real streaming
                for i in range(0, len(mock_text), 80):
                    chunk = mock_text[i:i+80]
                    await asyncio.sleep(0.05)
                    yield f"data: {json.dumps({'type': 'chunk', 'module': module_key, 'text': chunk})}\n\n"
                score_key = module_key.upper() + "_SCORE"
                score_match = re.search(rf"{score_key}: (\d+)", mock_text)
                score = int(score_match.group(1)) if score_match else 50
                yield f"data: {json.dumps({'type': 'module_complete', 'module': module_key, 'score': score})}\n\n"

            # Save to history list
            final_score = MOCK_FINAL_JSON["final_score"]
            report_id = str(uuid.uuid4())
            reports_store.insert(0, {
                "report_id": report_id,
                "company_name": company_name,
                "overall_risk": final_score,
                "timestamp": datetime.now().isoformat(),
                "verdict": MOCK_FINAL_JSON["verdict"]
            })
            if len(reports_store) > 10:
                reports_store.pop()

            chartData = {
                "solvency": generate_solvency_chart(MOCK_FINAL_JSON["debt_to_equity"], final_score),
                "velocity": generate_velocity_chart(final_score, MOCK_FINAL_JSON["key_findings"])
            }

            final_payload = {
                "type": "report_complete",
                "overall_risk": final_score,
                "metrics": {
                    "debt_to_equity": MOCK_FINAL_JSON["debt_to_equity"],
                    "current_ratio": MOCK_FINAL_JSON["current_ratio"],
                    "altman_z_score": MOCK_FINAL_JSON["altman_z_score"],
                    "interest_coverage": MOCK_FINAL_JSON["interest_coverage"]
                },
                "chartData": chartData,
                "key_findings": MOCK_FINAL_JSON["key_findings"],
                "verdict": MOCK_FINAL_JSON["verdict"]
            }
            yield f"data: {json.dumps(final_payload)}\n\n"
            yield "data: [DONE]\n\n"
            return

        # Phase 1: Stream the 5 modules sequentially
        for mod in MODULES:
            yield f"data: {json.dumps({'type': 'module_start', 'module': mod['id'], 'label': mod['label']})}\n\n"

            prompt = f"""
            Role: Senior Institutional Forensic Equity Analyst.
            Target: {company_name}
            Module: {mod['label']} ({mod['description']})
            Date: {datetime.now().strftime("%B %Y")}

            Provide 2-3 dense forensic bullet points analyzing this specific module for {company_name}.
            Be direct, institutional, and specific.
            """

            response = client.models.generate_content_stream(model=MODEL_ID, contents=prompt)
            
            module_text = ""
            for chunk in response:
                if chunk.text:
                    module_text += chunk.text
                    full_narrative += chunk.text
                    yield f"data: {json.dumps({'type': 'chunk', 'module': mod['id'], 'text': chunk.text})}\n\n"

            # Module score simulation
            mod_score = random.randint(10, 90)
            yield f"data: {json.dumps({'type': 'module_complete', 'module': mod['id'], 'score': mod_score})}\n\n"

        # Phase 2: Structured JSON extraction
        summary_prompt = f"""
        Analyze the following forensic audit narrative for {company_name} and extract key metrics.

        Risk level thresholds: LOW=0-29, MODERATE=30-54, HIGH=55-74, CRITICAL=75-99

        Narrative:
        {full_narrative}
        """

        structured_response = client.models.generate_content(
            model=MODEL_ID,
            contents=summary_prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ReportMetrics,
            },
        )

        report_data = json.loads(structured_response.text)
        final_score = report_data["final_score"]

        chartData = {
            "solvency": generate_solvency_chart(report_data["debt_to_equity"], final_score),
            "velocity": generate_velocity_chart(final_score, report_data["key_findings"])
        }

        report_id = str(uuid.uuid4())
        reports_store.insert(0, {
            "report_id": report_id,
            "company_name": company_name,
            "overall_risk": final_score,
            "timestamp": datetime.now().isoformat(),
            "verdict": report_data["verdict"]
        })

        if len(reports_store) > 10:
            reports_store.pop()

        final_payload = {
            "type": "report_complete",
            "overall_risk": final_score,
            "metrics": {
                "debt_to_equity": report_data["debt_to_equity"],
                "current_ratio": report_data["current_ratio"],
                "altman_z_score": report_data["altman_z_score"],
                "interest_coverage": report_data["interest_coverage"]
            },
            "chartData": chartData,
            "key_findings": report_data["key_findings"],
            "verdict": report_data["verdict"]
        }
        
        yield f"data: {json.dumps(final_payload)}\n\n"
        yield "data: [DONE]\n\n"

    except Exception as e:
        print("❌ CRITICAL ENGINE FAILURE:")
        traceback.print_exc()
        yield f"data: {json.dumps({'type': 'error', 'text': f'Audit Interrupted: {str(e)}'})}\n\n"
        yield "data: [DONE]\n\n"

# --- 4. API ENDPOINTS ---

from routers import upload
app.include_router(upload.router)

@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "model": MODEL_ID, "version": "3.1"}

@app.get("/api/v1/reports")
async def get_reports():
    return reports_store

@app.post("/api/v1/analyze")
async def analyze(request: Request):
    try:
        body = await request.json()
        company = body.get("company_name", "Global Index")
        return StreamingResponse(
            forensic_audit_generator(company), 
            media_type="text/event-stream"
        )
    except Exception as e:
        print(f"❌ Route Error: {e}")
        return {"error": "Failed to initiate audit"}

if __name__ == "__main__":
    import uvicorn
    # RUNNING ON PORT 8008 to bypass lingering 8001 socket locks
    print(f"🚀 VERIRISK ENGINE ONLINE | Port: {settings.PORT} | Model: {MODEL_ID} | Mock Mode: {USE_MOCK}")
    uvicorn.run(app, host="127.0.0.1", port=settings.PORT)
