"""
Report Storage Service
Persists completed due diligence reports to disk (JSON).
Swap out for a DB (Postgres, MongoDB) in production.
"""

import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from models.schemas import DueDiligenceReport
from utils.config import settings

logger = logging.getLogger(__name__)


class ReportStore:

    def __init__(self):
        self.reports_dir = Path(settings.REPORTS_DIR) if settings.REPORTS_DIR else None
        if self.reports_dir:
            self.reports_dir.mkdir(parents=True, exist_ok=True)

    def generate_report_id(self) -> str:
        return str(uuid.uuid4())

    async def save(self, report: DueDiligenceReport) -> str:
        """Persist report to disk. Returns report_id."""
        if not self.reports_dir:
            return report.report_id
        try:
            path = self.reports_dir / f"{report.report_id}.json"
            with open(path, "w", encoding="utf-8") as f:
                json.dump(report.model_dump(mode="json"), f, indent=2, default=str)
            logger.info(f"Report saved: {path}")
        except Exception as e:
            logger.error(f"Failed to save report {report.report_id}: {e}")
        return report.report_id

    async def get(self, report_id: str) -> Optional[DueDiligenceReport]:
        """Load a report by ID."""
        if not self.reports_dir:
            return None
        path = self.reports_dir / f"{report_id}.json"
        if not path.exists():
            return None
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            return DueDiligenceReport(**data)
        except Exception as e:
            logger.error(f"Failed to load report {report_id}: {e}")
            return None

    async def list_reports(
        self,
        company_filter: Optional[str] = None,
        limit: int = 50,
    ) -> list[dict]:
        """List saved reports (metadata only, no full content)."""
        if not self.reports_dir:
            return []

        # Use os.scandir for much faster file listing and mtime retrieval
        files = []
        try:
            with os.scandir(self.reports_dir) as entries:
                for entry in entries:
                    if entry.name.endswith('.json') and entry.is_file():
                        files.append((entry.stat().st_mtime, entry.path))
        except OSError:
            pass

        files.sort(reverse=True)
        top_files = [f[1] for f in files[:limit]]

        results = []
        for file_path in top_files:
            try:
                with open(file_path, encoding="utf-8") as fh:
                    data = json.load(fh)
                if company_filter and company_filter.lower() not in data.get("company_name", "").lower():
                    continue
                results.append({
                    "report_id": data["report_id"],
                    "company_name": data["company_name"],
                    "generated_at": data["generated_at"],
                    "status": data["status"],
                    "overall_score": data.get("overall_risk", {}).get("score"),
                    "overall_level": data.get("overall_risk", {}).get("level"),
                    "client_ref": data.get("client_ref"),
                })
            except Exception:
                continue
        return results

    async def delete(self, report_id: str) -> bool:
        if not self.reports_dir:
            return False
        path = self.reports_dir / f"{report_id}.json"
        if path.exists():
            path.unlink()
            return True
        return False
