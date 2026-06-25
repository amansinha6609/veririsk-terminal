from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from utils.config import settings

class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude OPTIONS for CORS
        if request.method == "OPTIONS":
            return await call_next(request)

        # Exclude health check and open endpoints if necessary
        if request.url.path in ["/api/v1/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Check API key from header or query param
        api_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")

        if not api_key:
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing API key authentication credentials."}
            )

        if api_key != settings.API_SECRET_KEY:
            return JSONResponse(
                status_code=403,
                content={"detail": "Invalid API key."}
            )

        return await call_next(request)
