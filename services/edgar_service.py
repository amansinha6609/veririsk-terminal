"""
SEC EDGAR Service
Fetches public company filings data from SEC EDGAR (free, no API key needed).
Useful for US-listed companies: 10-K, 10-Q, 8-K filings.
"""

import httpx
import logging
from typing import Optional

from utils.config import settings

logger = logging.getLogger(__name__)

EDGAR_SEARCH_BASE = "https://efts.sec.gov/LATEST/search-index"
EDGAR_COMPANY_SEARCH = "https://efts.sec.gov/LATEST/search-index?q=%22{query}%22&dateRange=custom&startdt={start}&enddt={end}&forms={forms}"
EDGAR_SUBMISSIONS_BASE = "https://data.sec.gov/submissions"
EDGAR_COMPANY_FACTS = "https://data.sec.gov/api/xbrl/companyfacts"

# SEC requires a user-agent identifying who you are
def _headers():
    return {"User-Agent": settings.SEC_EDGAR_USER_AGENT}


class SECEdgarService:

    def __init__(self):
        self.timeout = settings.EXTERNAL_API_TIMEOUT

    async def find_company_cik(self, company_name: str) -> Optional[str]:
        """
        Look up a company's CIK (Central Index Key) by name.
        """
        url = f"https://efts.sec.gov/LATEST/search-index?q=%22{company_name}%22&forms=10-K"
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=_headers()) as client:
                resp = await client.get(
                    "https://efts.sec.gov/LATEST/search-index",
                    params={"q": f'"{company_name}"', "forms": "10-K", "dateRange": "custom",
                            "startdt": "2020-01-01", "enddt": "2025-12-31"},
                )
                resp.raise_for_status()
                data = resp.json()
                hits = data.get("hits", {}).get("hits", [])
                if hits:
                    return hits[0].get("_source", {}).get("entity_id", "")
        except Exception as e:
            logger.warning(f"CIK lookup failed for {company_name}: {e}")
        return None

    async def get_recent_filings(
        self,
        company_name: str,
        form_types: list[str] = ["10-K", "10-Q", "8-K"],
        max_results: int = 10,
    ) -> list[dict]:
        """
        Search EDGAR full-text search for recent filings from a company.
        Returns list of {form_type, filed_date, description, url}.
        """
        try:
            forms_str = ",".join(form_types)
            async with httpx.AsyncClient(timeout=self.timeout, headers=_headers()) as client:
                resp = await client.get(
                    "https://efts.sec.gov/LATEST/search-index",
                    params={
                        "q": f'"{company_name}"',
                        "forms": forms_str,
                        "dateRange": "custom",
                        "startdt": "2022-01-01",
                        "enddt": "2025-12-31",
                        "_source": "period_of_report,file_date,form_type,display_names,entity_name",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

                filings = []
                for hit in data.get("hits", {}).get("hits", [])[:max_results]:
                    src = hit.get("_source", {})
                    filings.append({
                        "form_type": src.get("form_type", ""),
                        "filed_date": src.get("file_date", ""),
                        "period": src.get("period_of_report", ""),
                        "entity": src.get("entity_name", company_name),
                        "url": f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company={company_name}&type={src.get('form_type','10-K')}&dateb=&owner=include&count=10",
                    })
                return filings

        except Exception as e:
            logger.warning(f"EDGAR filings fetch failed for {company_name}: {e}")
            return []

    async def get_enforcement_actions(self, company_name: str) -> list[dict]:
        """
        Search for SEC enforcement actions (litigation releases, admin proceedings).
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=_headers()) as client:
                resp = await client.get(
                    "https://efts.sec.gov/LATEST/search-index",
                    params={
                        "q": f'"{company_name}"',
                        "forms": "LITRLS,AP",  # litigation releases, admin proceedings
                        "dateRange": "custom",
                        "startdt": "2018-01-01",
                        "enddt": "2025-12-31",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

                actions = []
                for hit in data.get("hits", {}).get("hits", [])[:5]:
                    src = hit.get("_source", {})
                    actions.append({
                        "form_type": src.get("form_type", ""),
                        "filed_date": src.get("file_date", ""),
                        "entity": src.get("entity_name", ""),
                        "description": src.get("period_of_report", ""),
                    })
                return actions

        except Exception as e:
            logger.warning(f"EDGAR enforcement search failed: {e}")
            return []

    def format_filings_summary(self, filings: list[dict]) -> str:
        """Format filing list as a readable context block."""
        if not filings:
            return "No SEC EDGAR filings found for this company (may be non-US or private)."
        lines = [f"SEC EDGAR Filings ({len(filings)} found):"]
        for f in filings:
            lines.append(f"  • {f['form_type']} — filed {f['filed_date']} (period: {f['period']})")
        return "\n".join(lines)
