"""
Reports Router
GET/DELETE endpoints for saved due diligence reports.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.schemas import DueDiligenceReport
from services.report_store import ReportStore

router = APIRouter()
_store = ReportStore()


@router.get(
    "/reports",
    summary="List all saved reports",
    response_model=list[dict],
)
async def list_reports(
    company: Optional[str] = Query(None, description="Filter by company name"),
    limit: int = Query(50, ge=1, le=200),
):
    return await _store.list_reports(company_filter=company, limit=limit)


@router.get(
    "/reports/{report_id}",
    summary="Get a full report by ID",
    response_model=DueDiligenceReport,
)
async def get_report(report_id: str):
    report = await _store.get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return report


@router.delete(
    "/reports/{report_id}",
    summary="Delete a report",
)
async def delete_report(report_id: str):
    deleted = await _store.delete(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return {"deleted": True, "report_id": report_id}
