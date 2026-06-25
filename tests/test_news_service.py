import pytest
from unittest.mock import patch, AsyncMock
import httpx
from services.news_service import NewsAPIService

@pytest.mark.asyncio
async def test_fetch_recent_news_http_error():
    service = NewsAPIService()
    service.api_key = "dummy_key"

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        request = httpx.Request("GET", "https://newsapi.org/v2/everything")
        response = httpx.Response(500, request=request, text="Internal Server Error")
        mock_error = httpx.HTTPStatusError("500 Server Error", request=request, response=response)

        mock_get.side_effect = mock_error

        result = await service.fetch_recent_news("Apple Inc")

        assert result == []
        mock_get.assert_called_once()
