import uvicorn

from config.settings import get_settings


def main() -> None:

    settings = get_settings()
    if settings.host is None or settings.port is None:
        raise ValueError(
            "Both APP_HOST and APP_PORT must be provided in the environment.",
        )

    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )


if __name__ == "__main__":
    main()

