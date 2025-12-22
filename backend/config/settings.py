from functools import lru_cache
from typing import Any

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict  # type: ignore[import-untyped]


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="Backend Service", description="Service name")
    app_env: str = Field(
        default="development", 
        description="Application environment: development or production",
        validation_alias=AliasChoices("APP_ENV", "ENV")
    )
    app_version: str = Field(default="0.1.0", description="Service semantic version")
    api_prefix: str = Field(default="/api/v1", description="Base prefix for all API routes")
    host: str | None = Field(default="0.0.0.0", description="Host interface for the ASGI server")
    port: int | None = Field(default=8080, description="Port for the ASGI server")
    reload: bool | None = Field(default=False, description="Enable auto-reload in development")
    firebase_project_id: str | None = Field(
        default=None,
        description="Explicit Firestore project id. Defaults to credentials project.",
        validation_alias=AliasChoices("FIREBASE_PROJECT_ID", "GOOGLE_CLOUD_PROJECT"),
    )
    firebase_credentials_file: str | None = Field(
        default=None,
        description="Path to a service-account JSON for Firestore access.",
        validation_alias=AliasChoices("FIREBASE_CREDENTIALS_FILE", "GOOGLE_APPLICATION_CREDENTIALS"),
    )
    firestore_health_collection: str = Field(
        default="health_checks",
        description="Collection used for Firestore connectivity checks.",
    )
    gcs_bucket_name: str | None = Field(
        default=None,
        description="Google Cloud Storage bucket name for file uploads.",
        validation_alias=AliasChoices("GCS_BUCKET_NAME", "GOOGLE_CLOUD_STORAGE_BUCKET"),
    )
    llm_api_key: str = Field(
        default="dev-dummy-key",
        description="Secret key for authenticating LLM callbacks.",
        validation_alias=AliasChoices("LLM_API_KEY"),
    )
    auth_secret_key: str = Field(
        default="super-secret-dev-key",
        description="Session middleware secret key.",
        validation_alias=AliasChoices("AUTH_SECRET_KEY"),
    )
    google_client_id: str | None = Field(
        default=None,
        description="Google OAuth Client ID.",
        validation_alias=AliasChoices("GOOGLE_CLIENT_ID"),
    )
    google_client_secret: str | None = Field(
        default=None,
        description="Google OAuth Client Secret.",
        validation_alias=AliasChoices("GOOGLE_CLIENT_SECRET"),
    )
    github_client_id: str | None = Field(
        default=None,
        description="GitHub OAuth Client ID.",
        validation_alias=AliasChoices("GITHUB_CLIENT_ID"),
    )
    github_client_secret: str | None = Field(
        default=None,
        description="GitHub OAuth Client Secret.",
        validation_alias=AliasChoices("GITHUB_CLIENT_SECRET"),
    )
    google_server_metadata_url: str | None = Field(
        default="https://accounts.google.com/.well-known/openid-configuration",
        description="Google OAuth Server Metadata URL.",
        validation_alias=AliasChoices("GOOGLE_SERVER_METADATA_URL"),
    )
    github_access_token_url: str | None = Field(
        default="https://github.com/login/oauth/access_token",
        description="Github Access Token URL.",
        validation_alias=AliasChoices("GITHUB_ACCESS_TOKEN_URL"),
    )
    github_authorize_url: str | None = Field(
        default="https://github.com/login/oauth/authorize",
        description="Github Authorize URL.",
        validation_alias=AliasChoices("GITHUB_AUTHORIZE_URL"),
    )
    github_api_base_url: str | None = Field(
        default="https://api.github.com/",
        description="Github API Base URL.",
        validation_alias=AliasChoices("GITHUB_API_BASE_URL"),
    )

    agent_backend_url: str | None = Field(
        default="http://localhost:8000",
        description="URL of the agent backend service.",
        validation_alias=AliasChoices("AGENT_BACKEND_URL"),
    )

    frontend_url: str = Field(
        default="http://localhost:3000",
        description="Frontend URL for redirects.",
        validation_alias=AliasChoices("FRONTEND_URL"),
    )

    @model_validator(mode="before")
    @classmethod
    def apply_env_aliases(cls, data: Any) -> Any:

        if isinstance(data, dict):
            alias_map = {
                "app_name": ("APP_NAME",),
                "app_version": ("APP_VERSION",),
                "api_prefix": ("API_PREFIX",),
                "host": ("APP_HOST", "HOST"),
                "port": ("APP_PORT", "PORT"),
                "reload": ("APP_RELOAD", "RELOAD"),
                "firestore_health_collection": ("FIRESTORE_HEALTH_COLLECTION",),
            }
            for field, aliases in alias_map.items():
                if field in data and data[field] is not None:
                    continue
                for alias in aliases:
                    if alias in data and data[alias] is not None:
                        data[field] = data.pop(alias)
                        break
        return data


@lru_cache(maxsize=1)
def get_settings() -> Settings:

    return Settings()
