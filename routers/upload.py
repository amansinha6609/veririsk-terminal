import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import math

router = APIRouter()

@router.post("/api/upload")
async def upload_financials(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported.")

    contents = await file.read()

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    # We need to map standard columns regardless of exact case/spacing
    # Let's normalize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

    # We expect some key columns or rows.
    # If the file is structured as 1 row of data (wide format) or Key-Value pairs (long format).
    # Assuming it's wide format (1 row = 1 period/company) and we take the first row.
    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    data = df.iloc[0].to_dict()

    # Helper function to get value safely
    def get_val(keys):
        for key in keys:
            if key in data and pd.notna(data[key]):
                try:
                    return float(data[key])
                except ValueError:
                    pass
        return None

    # Extraction Logic
    total_revenue = get_val(["total_revenue", "revenue", "sales"])
    gross_profit = get_val(["gross_profit", "gross_margin"])
    operating_income = get_val(["operating_income", "ebit", "operating_profit"])
    ebitda = get_val(["ebitda"])
    net_income = get_val(["net_income", "net_profit"])
    total_assets = get_val(["total_assets", "assets"])
    total_liabilities = get_val(["total_liabilities", "liabilities"])
    retained_earnings = get_val(["retained_earnings"])
    working_capital = get_val(["working_capital"])
    market_cap = get_val(["market_cap", "market_capitalization"])

    # Optional values for previous year to show variance if provided
    total_revenue_py = get_val(["total_revenue_py", "revenue_py", "sales_py"])
    gross_profit_py = get_val(["gross_profit_py", "gross_margin_py"])
    operating_income_py = get_val(["operating_income_py", "ebit_py", "operating_profit_py"])
    ebitda_py = get_val(["ebitda_py"])
    net_income_py = get_val(["net_income_py", "net_profit_py"])

    # Provide defaults if absolutely missing for statement mapping
    statement = {
        "Total Revenue": {"current": total_revenue, "previous": total_revenue_py},
        "Gross Profit": {"current": gross_profit, "previous": gross_profit_py},
        "Operating Income": {"current": operating_income, "previous": operating_income_py},
        "EBITDA": {"current": ebitda, "previous": ebitda_py},
        "Net Income": {"current": net_income, "previous": net_income_py},
    }

    # Calculate Altman Z-Score
    # Z = 1.2X1 + 1.4X2 + 3.3X3 + 0.6X4 + 0.999X5
    # X1 = Working Capital/Total Assets
    # X2 = Retained Earnings/Total Assets
    # X3 = EBIT/Total Assets (Using operating_income as proxy for EBIT)
    # X4 = Market Cap/Total Liabilities
    # X5 = Sales/Total Assets (Using total_revenue as Sales)

    z_score = None
    if all(v is not None for v in [working_capital, total_assets, retained_earnings, operating_income, total_liabilities, market_cap, total_revenue]):
        if total_assets != 0 and total_liabilities != 0:
            x1 = working_capital / total_assets
            x2 = retained_earnings / total_assets
            x3 = operating_income / total_assets
            x4 = market_cap / total_liabilities
            x5 = total_revenue / total_assets
            z_score = (1.2 * x1) + (1.4 * x2) + (3.3 * x3) + (0.6 * x4) + (0.999 * x5)
            z_score = round(z_score, 2)

    # If any required value is None but we need to supply a dummy to the frontend or return N/A
    # We will return None for Z-score if missing required data to let frontend handle it or fallback.

    return {
        "filename": file.filename,
        "statement": statement,
        "metrics": {
            "working_capital": working_capital,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "retained_earnings": retained_earnings,
            "market_cap": market_cap
        },
        "z_score": z_score
    }
