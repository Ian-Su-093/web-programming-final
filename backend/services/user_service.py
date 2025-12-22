from authlib.integrations.starlette_client import OAuth  # type: ignore[import-untyped]
from starlette.config import Config

from config.settings import Settings
from models.user import UserModel, UserPreference, UserProfile
from repository.user_repository import UserRepository


class UserService:

    def __init__(self, settings: Settings, repository: UserRepository) -> None:
        self._repository = repository
        self._oauth = OAuth(Config(environ={}))
        self._register_providers(settings)

    def _register_providers(self, settings: Settings) -> None:
        if settings.google_client_id and settings.google_client_secret:
            self._oauth.register(
                name="google",
                client_id=settings.google_client_id,
                client_secret=settings.google_client_secret,
                server_metadata_url=settings.google_server_metadata_url,
                client_kwargs={"scope": "openid email profile"},
            )

        if settings.github_client_id and settings.github_client_secret:
            self._oauth.register(
                name="github",
                client_id=settings.github_client_id,
                client_secret=settings.github_client_secret,
                access_token_url=settings.github_access_token_url,
                access_token_params=None,
                authorize_url=settings.github_authorize_url,
                authorize_params=None,
                api_base_url=settings.github_api_base_url,
                client_kwargs={"scope": "user:email"},
            )

    @property
    def oauth(self) -> OAuth:
        return self._oauth

    async def get_user(self, user_profile: UserProfile) -> UserProfile:
        return await self._repository.get_or_create_user(user_profile)

    async def update_user_preference(self, user_id: str, new_preference: UserPreference) -> None:
        return await self._repository.update_user_preference(user_id, new_preference)