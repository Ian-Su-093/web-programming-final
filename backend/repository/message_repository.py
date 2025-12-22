import asyncio
from typing import Any, Optional

from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from models.message import MessageModel


class MessageRepository:
    def __init__(self, client: firestore.Client, collection: str = "message") -> None:
        self._client = client
        self._collection = collection

    async def create_message(self, course_id: str, message: MessageModel) -> MessageModel:
        
        def _sync_create_message() -> MessageModel:
            messages_ref = self._client.collection(self._collection)
            
            # Start a transaction to ensure index consistency
            @firestore.transactional
            def create_in_transaction(transaction: firestore.Transaction) -> MessageModel:
                # Query specifically for this course to find the max index
                # We need to order by index descending and limit to 1
                query = messages_ref.where(filter=FieldFilter("course_id", "==", course_id))\
                                    .order_by("index", direction=firestore.Query.DESCENDING)\
                                    .limit(1)
                
                # Transactional query
                results = list(query.stream(transaction=transaction))
                
                next_index = 0
                if results:
                    last_msg = results[0].to_dict()
                    if last_msg and "index" in last_msg:
                        next_index = last_msg["index"] + 1
                
                # Create new document reference
                new_doc_ref = messages_ref.document()
                
                # Prepare data
                message_data = message.model_dump(exclude_none=True)
                message_data["id"] = new_doc_ref.id
                message_data["course_id"] = course_id
                message_data["index"] = next_index
                
                # Write to transaction
                transaction.set(new_doc_ref, message_data)
                
                return MessageModel(**message_data)

            transaction = self._client.transaction()
            return create_in_transaction(transaction)

        return await asyncio.to_thread(_sync_create_message)

    async def get_all_messages_by_course_id(self, course_id: str) -> list[MessageModel]:
        
        def _sync_get_all() -> list[MessageModel]:
            messages_ref = self._client.collection(self._collection)
            query = messages_ref.where(filter=FieldFilter("course_id", "==", course_id))\
                                .order_by("index", direction=firestore.Query.ASCENDING)
            
            docs = query.stream()
            return [MessageModel(**doc.to_dict()) for doc in docs if doc.to_dict()]

        return await asyncio.to_thread(_sync_get_all)

    async def get_message_by_id(self, message_id: str) -> Optional[MessageModel]:
        
        def _sync_get_by_id() -> Optional[MessageModel]:
            doc_ref = self._client.collection(self._collection).document(message_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return MessageModel(**doc.to_dict())
            return None

        return await asyncio.to_thread(_sync_get_by_id)
