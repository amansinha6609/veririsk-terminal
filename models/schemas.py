"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# ── Enums ────────────────────────────────────────────────────────────────────

class AnalysisModule(str, Enum):
    OVERVIEW     = "overview"
    FINANCIAL    = "financial"
    LEGAL        = "legal"
    REPUTATION   = "reputation"
    LEADERSHIP   = "leadership"
    CYBER        = "cyber"
    ESG          = "esg"
    COMPETITIVE  = "competitive"


class RiskLevel(str, Enum):
    LOW      = "low"
    MODERATE = "moderate"
    HIGH     = "high"
    CRITICAL = "critical"


# ── Request models ────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200, description="Company name, domain, or ticker")
    modules: List[AnalysisModule] = Field(
        default=list(AnalysisModule),
        description="Which due diligence modules to run"
    )
    client_ref: Optional[str] = Field(None, description="Optional client reference ID for your records")

    model_config = {"json_schema_extra": {"example": {
        "company_name": "Adani Group",
        "modules": ["overview", "financial", "legal", "reputation"],
        "client_ref": "client-abc-123"
    }}}


# ── Section-level models ──────────────────────────────────────────────────────

class SectionSource(BaseModel):
    title: str
    url: Optional[str] = None
    source_type: str  # "web_search" | "news_api" | "sec_edgar" | "serpapi"


class ModuleResult(BaseModel):
    module: AnalysisModule
    status: str  # "running" | "complete" | "error"
    content: str = ""
    risk_score: Optional[int] = Field(None, ge=0, le=100)
    risk_level: Optional[RiskLevel] = None
    key_findings: List[str] = []
    sources: List[SectionSource] = []
    error: Optional[str] = None
    duration_ms: Optional[int] = None


# ── Final report model ────────────────────────────────────────────────────────

class OverallRisk(BaseModel):
    score: int = Field(..., ge=0, le=100)
    level: RiskLevel
    summary: str
    critical_flags: List[str] = []


class DueDiligenceReport(BaseModel):
    report_id: str
    company_name: str
    client_ref: Optional[str] = None
    generated_at: datetime
    modules: Dict[str, ModuleResult]
    overall_risk: Optional[OverallRisk] = None
    status: str  # "running" | "complete" | "partial"
    duration_ms: Optional[int] = None


# ── SSE streaming event models ────────────────────────────────────────────────

class SSEEventType(str, Enum):
    MODULE_START    = "module_start"
    MODULE_CHUNK    = "module_chunk"        # streaming text delta
    MODULE_COMPLETE = "module_complete"     # final result for one module
    MODULE_ERROR    = "module_error"
    REPORT_COMPLETE = "report_complete"     # full final report
    ERROR           = "error"


class SSEEvent(BaseModel):
    event: SSEEventType
    data: Dict[str, Any]
