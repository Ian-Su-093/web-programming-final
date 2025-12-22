from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from google.cloud import firestore


class FirestoreRepository:
    """Minimal wrapper to communicate with Google Firestore."""

    def __init__(self, client: firestore.Client) -> None:
        self._client = client

    async def check_health(self, collection: str) -> dict[str, Any]:
        """Write and read a heartbeat document to verify connectivity."""

        def _write_and_read() -> dict[str, Any]:
            doc_ref = self._client.collection(collection).document("heartbeat")
            payload = {
                "status": "ok",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            doc_ref.set(payload)
            snapshot = doc_ref.get()
            return snapshot.to_dict() or payload

        return await asyncio.to_thread(_write_and_read)

    async def create_document(self, collection: str, data: dict[str, Any]) -> tuple[str, dict[str, Any]]:
        """Store a document in the specified collection."""

        def _create() -> tuple[str, dict[str, Any]]:
            # Let Firestore auto-generate the ID by calling document() without args
            doc_ref = self._client.collection(collection).document()
            doc_ref.set(data)
            return doc_ref.id, data

        return await asyncio.to_thread(_create)
