from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health", summary="Health check")
async def health():
    return {
        "status": "ok",
        "service": "DueDiligenceAI API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
    }
