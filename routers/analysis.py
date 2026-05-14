"""
Analysis Router
POST /api/v1/analyze  →  SSE stream + final JSON report
"""

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.schemas import (
    AnalysisModule, AnalysisRequest, DueDiligenceReport,
    ModuleResult, OverallRisk, RiskLevel, SSEEvent, SSEEventType,
)
from services.claude_service import ClaudeAnalysisService, _score_to_level
from services.news_service import NewsAPIService
from services.serp_service import SerpAPIService
from services.edgar_service import SECEdgarService
from services.report_store import ReportStore
from utils.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Singletons
_claude = ClaudeAnalysisService()
_news   = NewsAPIService()
_serp   = SerpAPIService()
_edgar  = SECEdgarService()
_store  = ReportStore()

# Simple semaphore to cap concurrency
_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_ANALYSES)


def _sse(event: SSEEventType, data: dict) -> str:
    """Format a Server-Sent Event string."""
    payload = json.dumps({"event": event.value, "data": data}, default=str)
    return f"data: {payload}\n\n"


async def _run_analysis(
    company: str,
    modules: list[AnalysisModule],
    report_id: str,
    client_ref: str | None,
) -> AsyncGenerator[str, None]:
    """
    Core generator: enriches context, runs Claude per module, streams results.
    """
    start = time.time()
    module_results: dict[str, ModuleResult] = {}

    # ── 1. Pre-fetch enrichment data in parallel ──────────────────────────────
    yield _sse(SSEEventType.MODULE_START, {
        "module": "enrichment",
        "message": f"Fetching external context for {company}…"
    })

    news_task   = asyncio.create_task(_news.fetch_recent_news(company))
    edgar_task  = asyncio.create_task(_edgar.get_recent_filings(company))

    news_articles, edgar_filings = await asyncio.gather(news_task, edgar_task)
    news_sentiment = _news.sentiment_summary(news_articles)
    edgar_summary  = _edgar.format_filings_summary(edgar_filings)

    enrichment_context = {
        "news_sentiment": news_sentiment,
        "edgar_filings": edgar_summary,
        "top_headlines": news_sentiment.get("top_headlines", []),
    }

    yield _sse(SSEEventType.MODULE_COMPLETE, {
        "module": "enrichment",
        "data": enrichment_context,
    })

    # ── 2. Run each analysis module ───────────────────────────────────────────
    for module in modules:
        yield _sse(SSEEventType.MODULE_START, {
            "module": module.value,
            "label": module.value.replace("_", " ").title(),
        })

        # Optional: fetch SerpAPI context first (inject into Claude prompt if needed)
        serp_results = await _serp.fetch_module_context(company, module.value)
        # (serp_results are available here — you can inject into the prompt
        #  by modifying ClaudeAnalysisService.analyze_module_stream to accept extra_context)

        full_result: ModuleResult | None = None

        async for event in _claude.analyze_module_stream(company, module):
            if event["type"] == "chunk":
                yield _sse(SSEEventType.MODULE_CHUNK, {
                    "module": module.value,
                    "text": event["text"],
                    "visible_text": event.get("visible_text", ""),
                })

            elif event["type"] == "complete":
                full_result = event["result"]
                # Attach SerpAPI sources
                for r in serp_results[:3]:
                    full_result.sources.append({
                        "title": r.get("title", ""),
                        "url": r.get("link", ""),
                        "source_type": "serpapi",
                    })
                module_results[module.value] = full_result
                yield _sse(SSEEventType.MODULE_COMPLETE, {
                    "module": module.value,
                    "risk_score": full_result.risk_score,
                    "risk_level": full_result.risk_level.value if full_result.risk_level else None,
                    "key_findings": full_result.key_findings,
                    "duration_ms": full_result.duration_ms,
                })

            elif event["type"] == "error":
                err_result = ModuleResult(
                    module=module,
                    status="error",
                    error=event.get("error", "Unknown error"),
                    risk_score=50,
                    risk_level=RiskLevel.MODERATE,
                )
                module_results[module.value] = err_result
                yield _sse(SSEEventType.MODULE_ERROR, {
                    "module": module.value,
                    "error": event.get("error"),
                })

    # ── 3. Synthesize overall risk ────────────────────────────────────────────
    overall_data = await _claude.generate_overall_risk(company, module_results)
    overall_risk = OverallRisk(
        score=overall_data["score"],
        level=RiskLevel(overall_data["level"]),
        summary=overall_data["summary"],
        critical_flags=overall_data.get("critical_flags", []),
    )

    # ── 4. Build and persist final report ─────────────────────────────────────
    duration_ms = int((time.time() - start) * 1000)
    report = DueDiligenceReport(
        report_id=report_id,
        company_name=company,
        client_ref=client_ref,
        generated_at=datetime.now(timezone.utc),
        modules=module_results,
        overall_risk=overall_risk,
        status="complete",
        duration_ms=duration_ms,
    )
    await _store.save(report)

    yield _sse(SSEEventType.REPORT_COMPLETE, {
        "report_id": report_id,
        "overall_risk": {
            "score": overall_risk.score,
            "level": overall_risk.level.value,
            "summary": overall_risk.summary,
            "critical_flags": overall_risk.critical_flags,
        },
        "module_scores": {k: v.risk_score for k, v in module_results.items()},
        "duration_ms": duration_ms,
        "report": report.model_dump(mode="json"),
    })


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    summary="Run due diligence analysis (SSE stream)",
    response_description="Server-Sent Events stream, then final JSON report",
)
async def analyze(request: AnalysisRequest):
    """
    Stream a full due diligence analysis for a company.

    **Response format:** `text/event-stream`
    Each event: `data: {"event": "<type>", "data": {...}}\n\n`

    Event types:
    - `module_start` — module beginning
    - `module_chunk` — streaming text delta
    - `module_complete` — module done with risk score
    - `module_error` — module failed
    - `report_complete` — full report JSON
    """
    report_id = str(uuid.uuid4())

    async def stream_with_semaphore():
        async with _semaphore:
            async for chunk in _run_analysis(
                company=request.company_name,
                modules=request.modules,
                report_id=report_id,
                client_ref=request.client_ref,
            ):
                yield chunk
        # End-of-stream sentinel
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_with_semaphore(),
        media_type="text/event-stream",
        headers={
            "X-Report-ID": report_id,
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        },
    )
