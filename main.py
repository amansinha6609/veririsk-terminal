import os
import json
import re
import traceback
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
from utils.config import settings

# --- 1. CONFIGURATION & ENVIRONMENT ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
# Using the specific GA model confirmed via your scan
MODEL_ID = 'models/gemini-3.1-flash-lite'
model = genai.GenerativeModel(MODEL_ID)

# --- 3. FORENSIC AUDIT LOGIC ---
async def forensic_audit_generator(company_name: str):
    full_analysis_text = ""
    try:
        # THE SOLVENCY SHIELD PROMPT
        # Specifically tuned to distinguish between 'Legal Noise' and 'Terminal Insolvency'
        prompt = f"""
        Role: Senior Institutional Forensic Equity Analyst.
        Target: {company_name}
        Date: {datetime.now().strftime("%B %Y")}

        AUDIT PROTOCOL:
        1. SOLVENCY SHIELD: If Cash & Equivalents > Total Debt, risk is naturally LOW. 
           Regulatory fines (DOJ/EU/SEC) for cash-rich firms are 'Operational Expenses,' NOT bankruptcy risks.
        2. AUDITOR FLAG: Prioritize any 'Going Concern' material uncertainty or Qualified Opinions.
        3. WEIGHTING:
           - Accumulated Losses > Equity: +40 Risk.
           - Interest Coverage Ratio < 1.0: +30 Risk.
           - Massive Cash Surplus: -50 Risk (Hard Floor).

        FORMAT:
        - 3-4 Dense forensic bullet points.
        - MUST INCLUDE THESE EXACT LINES ANYWHERE IN THE OUTPUT:
          FINAL_SCORE: [number 1-100]
          DEBT_TO_EQUITY: [number]
          CURRENT_RATIO: [number]
          ALTMAN_Z_SCORE: [number]
          INTEREST_COVERAGE: [number]
        """

        response = model.generate_content(prompt, stream=True)

        for chunk in response:
            if chunk.text:
                full_analysis_text += chunk.text
                # Streaming with double-newline delimiter for the React buffer
                yield f"data: {json.dumps({'text': chunk.text})}\n\n"

        # --- INTELLIGENT SCORE & METRICS SCRAPER ---
        # Look for the labels
        score_match = re.search(r"FINAL_SCORE[:\s]*(\d+)", full_analysis_text, re.IGNORECASE)
        
        if score_match:
            final_risk_score = int(score_match.group(1))
        else:
            distress_keywords = ["insolvency", "going concern", "qualified opinion", "default"]
            is_distressed = any(word in full_analysis_text.lower() for word in distress_keywords)
            final_risk_score = 85 if is_distressed else 15
            
        final_risk_score = max(1, min(99, final_risk_score))

        # Scrape Metrics
        def extract_metric(label, default_val):
            match = re.search(rf"{label}[:\s]*([\d\.]+)", full_analysis_text, re.IGNORECASE)
            return float(match.group(1)) if match else default_val

        metrics = {
            "debt_to_equity": extract_metric("DEBT_TO_EQUITY", 1.5),
            "current_ratio": extract_metric("CURRENT_RATIO", 1.2),
            "altman_z_score": extract_metric("ALTMAN_Z_SCORE", 2.1),
            "interest_coverage": extract_metric("INTEREST_COVERAGE", 3.5),
        }

        # Generate Simulated Chart Data based on Risk Score
        base_debt = 10 + (final_risk_score / 10)
        base_cash = 20 - (final_risk_score / 10)
        chartData = {
            "solvency": [
                {"quarter": "Q1", "debt": round(base_debt * 0.9, 1), "cash": round(base_cash * 1.1, 1)},
                {"quarter": "Q2", "debt": round(base_debt * 0.95, 1), "cash": round(base_cash * 1.05, 1)},
                {"quarter": "Q3", "debt": round(base_debt, 1), "cash": round(base_cash, 1)},
                {"quarter": "Q4", "debt": round(base_debt * 1.1, 1), "cash": round(base_cash * 0.9, 1)},
            ],
            "velocity": [
                {"time": "T-90", "risk": max(1, final_risk_score - 15)},
                {"time": "T-60", "risk": max(1, final_risk_score - 5)},
                {"time": "T-30", "risk": min(99, final_risk_score + 10)},
                {"time": "NOW", "risk": final_risk_score},
            ]
        }
        
        print(f"📊 Audit Complete: {company_name} | Risk Score: {final_risk_score}")
        yield f"data: {json.dumps({'overall_risk': final_risk_score, 'metrics': metrics, 'chartData': chartData})}\n\n"

    except Exception as e:
        print("❌ CRITICAL ENGINE FAILURE:")
        traceback.print_exc()
        # Fallback to the 'Panic Score' 44 if the engine physically crashes
        yield f"data: {json.dumps({'text': f'Audit Interrupted: {str(e)}', 'overall_risk': 44})}\n\n"

# --- 4. API ENDPOINTS ---

from routers import upload
app.include_router(upload.router)

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
    print("🚀 VERIRISK ENGINE ONLINE | Port: 8008 | Model: Gemini 3.1 Flash-Lite")
    uvicorn.run(app, host="127.0.0.1", port=8008)