import os
from functools import lru_cache

from google.cloud import storage


@lru_cache(maxsize=1)
def get_storage_client(
    project_id: str | None,
    credentials_file: str | None,
) -> storage.Client:

    resolved_credentials_file = _resolve_credentials_path(credentials_file)

    if resolved_credentials_file:
        return storage.Client.from_service_account_json(
            resolved_credentials_file,
            project=project_id,
        )
    
    return storage.Client(project=project_id)


def _resolve_credentials_path(explicit_path: str | None) -> str | None:

    candidates = [
        explicit_path,
        os.getenv("FIREBASE_CREDENTIALS_FILE"),
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
    ]

    for path in candidates:
        if path:
            if os.path.exists(path):
                return path
            if path == explicit_path:
                raise FileNotFoundError(f"Storage credentials file not found at '{path}'.")

    return None

