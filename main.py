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
        - FINAL LINE MUST BE: FINAL_SCORE: [number 1-100]
        """

        response = model.generate_content(prompt, stream=True)

        for chunk in response:
            if chunk.text:
                full_analysis_text += chunk.text
                # Streaming with double-newline delimiter for the React buffer
                yield f"data: {json.dumps({'text': chunk.text})}\n\n"

        # --- INTELLIGENT SCORE SCRAPER ---
        # Look for the FINAL_SCORE label
        score_match = re.search(r"FINAL_SCORE[:\s]*(\d+)", full_analysis_text, re.IGNORECASE)
        
        if score_match:
            final_risk_score = int(score_match.group(1))
        else:
            # Fallback Logic: If the AI gets too wordy, we scan the text for red-flag keywords
            distress_keywords = ["insolvency", "going concern", "qualified opinion", "default"]
            is_distressed = any(word in full_analysis_text.lower() for word in distress_keywords)
            final_risk_score = 85 if is_distressed else 15
            
        # Ensure score stays within bounds
        final_risk_score = max(1, min(99, final_risk_score))
        
        print(f"📊 Audit Complete: {company_name} | Risk Score: {final_risk_score}")
        yield f"data: {json.dumps({'overall_risk': final_risk_score})}\n\n"

    except Exception as e:
        print("❌ CRITICAL ENGINE FAILURE:")
        traceback.print_exc()
        # Fallback to the 'Panic Score' 44 if the engine physically crashes
        yield f"data: {json.dumps({'text': f'Audit Interrupted: {str(e)}', 'overall_risk': 44})}\n\n"

# --- 4. API ENDPOINTS ---
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