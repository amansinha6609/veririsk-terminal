"""
SerpAPI (Google Search) Enrichment Service
Runs targeted Google searches to feed structured results into the analysis pipeline.
"""

import asyncio
import httpx
import logging
from typing import Optional

from utils.config import settings

logger = logging.getLogger(__name__)

SERPAPI_BASE = "https://serpapi.com/search"

# Targeted search templates per module
MODULE_SEARCH_QUERIES: dict[str, list[str]] = {
    "overview": [
        "{company} company overview funding founders",
        "{company} business model revenue 2024 2025",
    ],
    "financial": [
        "{company} revenue profit loss annual report 2024",
        "{company} funding rounds valuation investors",
        "{company} financial results earnings",
    ],
    "legal": [
        "{company} lawsuit litigation legal action 2024 2025",
        "{company} regulatory fine penalty investigation",
        "{company} SEC SEBI FTC enforcement action",
    ],
    "reputation": [
        "{company} controversy scandal news 2024 2025",
        "{company} customer complaints product issues recall",
    ],
    "leadership": [
        "{company} CEO founder controversy misconduct",
        "{company} board directors governance issues",
        "{company} executive insider trading charged",
    ],
    "cyber": [
        "{company} data breach cybersecurity incident",
        "{company} GDPR fine privacy violation",
        "{company} hacked ransomware security",
    ],
    "esg": [
        "{company} ESG rating environmental controversy",
        "{company} labor practices workers controversy",
        "{company} greenwashing sustainability claims",
    ],
    "competitive": [
        "{company} market share competitors 2024",
        "{company} competitive advantage moat analysis",
    ],
}


class SerpAPIService:

    def __init__(self):
        self.api_key = settings.SERP_API_KEY
        self.timeout = settings.EXTERNAL_API_TIMEOUT

    async def search(self, query: str, num_results: int = 5) -> list[dict]:
        """
        Run a single Google search via SerpAPI.
        Returns list of {title, snippet, link, date}.
        """
        if not self.api_key:
            logger.warning("SERP_API_KEY not set — skipping SerpAPI enrichment")
            return []

        params = {
            "q": query,
            "num": num_results,
            "api_key": self.api_key,
            "engine": "google",
            "hl": "en",
            "gl": "us",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(SERPAPI_BASE, params=params)
                resp.raise_for_status()
                data = resp.json()

                results = []
                for r in data.get("organic_results", []):
                    results.append({
                        "title": r.get("title", ""),
                        "snippet": r.get("snippet", ""),
                        "link": r.get("link", ""),
                        "date": r.get("date", ""),
                    })
                return results

        except httpx.HTTPStatusError as e:
            logger.error(f"SerpAPI HTTP error: {e.response.status_code}")
            return []
        except Exception as e:
            logger.error(f"SerpAPI search failed: {e}")
            return []

    async def fetch_module_context(
        self, company: str, module: str, max_queries: int = 2
    ) -> list[dict]:
        """
        Run targeted searches for a given analysis module.
        Returns deduplicated result list.
        """
        queries = MODULE_SEARCH_QUERIES.get(module, [])[:max_queries]
        formatted_queries = [q.replace("{company}", company) for q in queries]

        # Parallelize search requests
        tasks = [self.search(fq, num_results=3) for fq in formatted_queries]
        search_results = await asyncio.gather(*tasks)

        return self._process_search_results(formatted_queries, search_results)

    def _process_search_results(
        self, queries: list[str], results_sets: list[list[dict]]
    ) -> list[dict]:
        """
        Deduplicate search results across multiple queries and tag with source query.
        """
        all_results: list[dict] = []
        seen_links: set[str] = set()

        for query, results in zip(queries, results_sets):
            for r in results:
                if r["link"] not in seen_links:
                    seen_links.add(r["link"])
                    r["query"] = query
                    all_results.append(r)

        return all_results

    def format_for_prompt(self, results: list[dict]) -> str:
        """
        Format search results as a context block to inject into Claude prompts.
        """
        if not results:
            return ""
        lines = ["--- Google Search Context ---"]
        for r in results[:8]:
            lines.append(f"• {r['title']}")
            if r.get("snippet"):
                lines.append(f"  {r['snippet'][:200]}")
            if r.get("link"):
                lines.append(f"  {r['link']}")
        lines.append("--- End Context ---")
        return "\n".join(lines)
