"""
NewsAPI Enrichment Service
Fetches recent news articles for a company to supplement Claude's analysis.
"""

import httpx
import logging
from datetime import datetime, timedelta
from typing import Optional

from utils.config import settings

logger = logging.getLogger(__name__)

NEWSAPI_BASE = "https://newsapi.org/v2/everything"


class NewsAPIService:

    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.timeout = settings.EXTERNAL_API_TIMEOUT

    async def fetch_recent_news(
        self,
        company_name: str,
        days_back: int = 90,
        max_articles: int = 10,
        language: str = "en",
    ) -> list[dict]:
        """
        Fetch recent news articles for a company.
        Returns list of {title, description, url, publishedAt, source}.
        """
        if not self.api_key:
            logger.warning("NEWS_API_KEY not set — skipping NewsAPI enrichment")
            return []

        from_date = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")

        params = {
            "q": f'"{company_name}"',
            "from": from_date,
            "sortBy": "relevancy",
            "language": language,
            "pageSize": max_articles,
            "apiKey": self.api_key,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(NEWSAPI_BASE, params=params)
                resp.raise_for_status()
                data = resp.json()

                articles = []
                for a in data.get("articles", []):
                    articles.append({
                        "title": a.get("title", ""),
                        "description": a.get("description", ""),
                        "url": a.get("url", ""),
                        "published_at": a.get("publishedAt", ""),
                        "source": a.get("source", {}).get("name", ""),
                    })
                return articles

        except httpx.HTTPStatusError as e:
            logger.error(f"NewsAPI HTTP error: {e.response.status_code} — {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"NewsAPI fetch failed: {e}")
            return []

    def sentiment_summary(self, articles: list[dict]) -> dict:
        """
        Basic keyword-based sentiment scan.
        Returns counts and top headlines.
        """
        negative_kw = [
            "fraud", "lawsuit", "scandal", "bankrupt", "fine", "penalty",
            "investigation", "breach", "hack", "layoff", "recall", "default",
            "arrest", "accused", "corruption", "misconduct", "collapse",
        ]
        positive_kw = [
            "profit", "growth", "record", "expansion", "partnership", "award",
            "launch", "acquisition", "revenue", "milestone", "invest", "upgrade",
        ]

        neg, pos, neutral = 0, 0, 0
        for a in articles:
            text = (a.get("title", "") + " " + a.get("description", "")).lower()
            if any(k in text for k in negative_kw):
                neg += 1
            elif any(k in text for k in positive_kw):
                pos += 1
            else:
                neutral += 1

        return {
            "total_articles": len(articles),
            "positive": pos,
            "negative": neg,
            "neutral": neutral,
            "top_headlines": [a["title"] for a in articles[:5]],
        }
