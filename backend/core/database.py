import os
from functools import lru_cache

from google.cloud import firestore


@lru_cache(maxsize=1)
def get_firestore_client(
    project_id: str | None,
    credentials_file: str | None,
) -> firestore.Client:

    resolved_credentials_file = _resolve_credentials_path(credentials_file)

    if resolved_credentials_file:
        return firestore.Client.from_service_account_json(
            resolved_credentials_file,
            project=project_id,
        )
    
    return firestore.Client(project=project_id)


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
                raise FileNotFoundError(f"Firestore credentials file not found at '{path}'.")

    return None

