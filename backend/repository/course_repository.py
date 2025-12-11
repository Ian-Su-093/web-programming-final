from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from google.cloud import firestore

from models.course import CourseModel, Phase


class CourseRepository:
    def __init__(self, client: firestore.Client, collection: str = "courses") -> None:
        self._client = client
        self._collection = collection

    async def create_course(self, owner_id: str,name: str) -> CourseModel:

        def _sync_create_course() -> CourseModel:
            courses_ref = self._client.collection(self._collection)
            doc_ref = courses_ref.document()
            
            now = datetime.now(timezone.utc)
            
            new_course_data = {
                "id": doc_ref.id,
                "owner_id": owner_id,
                "name": name,
                "created_at": now,
                "updated_at": now,
                "phase": Phase.MARKDOWN
            }
            
            doc_ref.set(new_course_data)
            return CourseModel(**new_course_data)

        return await asyncio.to_thread(_sync_create_course)

    async def get_all_courses_by_userId(self, user_id: str) -> list[CourseModel]:
        
        def _sync_get_all_courses_by_userId() -> list[CourseModel]:
            courses_ref = self._client.collection(self._collection)

            query = courses_ref.where("owner_id", "==", user_id)

            docs = list(query.stream())

            return [CourseModel(**doc.to_dict()) for doc in docs]

        return await asyncio.to_thread(_sync_get_all_courses_by_userId)

    async def get_course_by_id(self, course_id: str) -> CourseModel | None:
        
        def _sync_get_course_by_id() -> CourseModel | None:
            doc_ref = self._client.collection(self._collection).document(course_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return CourseModel(**doc.to_dict())
            return None

        return await asyncio.to_thread(_sync_get_course_by_id)

    async def update_course_phase(self, course_id: str, phase: Phase) -> CourseModel | None:
        def _sync_update_course_phase() -> CourseModel | None:
            doc_ref = self._client.collection(self._collection).document(course_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            now = datetime.now(timezone.utc)
            update_data = {
                "phase": phase.value,
                "updated_at": now
            }
            
            doc_ref.update(update_data)
            
            # Fetch updated document
            updated_doc = doc_ref.get()
            return CourseModel(**updated_doc.to_dict())

        return await asyncio.to_thread(_sync_update_course_phase)