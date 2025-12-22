from functools import wraps
from typing import Any, Callable

from fastapi import HTTPException, Request, status

from config.settings import get_settings


def required_login(func: Callable[..., Any]) -> Callable[..., Any]:

    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:

        request: Request | None = None
        
        for arg in args:
            if isinstance(arg, Request):
                request = arg
                break
        
        if not request:
            request = kwargs.get("request")

        if not request:
            # Should not happend
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth decorator requires 'request' argument in endpoint.",
            )
        
        if not request.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated",
            )

        user = request.session.get("user")
        if not user or not user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated",
            )

        return await func(*args, **kwargs)

    return wrapper


def required_api_key(func: Callable[..., Any]) -> Callable[..., Any]:

    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:

        request: Request | None = None
        
        for arg in args:
            if isinstance(arg, Request):
                request = arg
                break
        
        if not request:
            request = kwargs.get("request")

        if not request:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth decorator requires 'request' argument in endpoint.",
            )

        api_key = request.headers.get("X-LLM-API-Key")
        settings = get_settings()

        if not api_key or api_key != settings.llm_api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="X-LLM-API-Key is not valid or missing",
            )

        return await func(*args, **kwargs)

    return wrapper
