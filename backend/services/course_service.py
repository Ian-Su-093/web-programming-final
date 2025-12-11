from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import HTTPException, UploadFile, status
from google.api_core.exceptions import GoogleAPICallError
import io
from pypdf import PdfReader

from config.settings import get_settings
from models.course import CourseModel, Phase
from models.message import MessageModel, Role
from models.user import UserModel
from repository.course_repository import CourseRepository
from repository.message_repository import MessageRepository
from repository.storage_repository import StorageRepository


class CourseService:
    def __init__(
        self, 
        repository: CourseRepository,
        storage_repository: StorageRepository,
        message_repository: MessageRepository,
    ) -> None:
        self._repository = repository
        self._storage_repository = storage_repository
        self._message_repository = message_repository
    
    async def create_course(self, user: UserModel, name: str, files: list[UploadFile]) -> CourseModel:
        
        # Validate files are PDFs
        for file in files:
            if file.content_type != "application/pdf":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File '{file.filename}' is not a PDF. Only PDF files are allowed.",
                )

        # 1. Create the course document first to get the ID
        course = await self._repository.create_course(user.id, name)
        
        # 2. Upload files to GCS under /{user_id}/{course_id}/user_upload/
        for file in files:
            if not file.filename:
                continue
            
            try:
                # Read file content asynchronously
                content = await file.read()
                
                # If PDF, extract text and save as .srt
                if file.content_type == "application/pdf":
                    try:
                        # Extract text from PDF
                        pdf_file = io.BytesIO(content)
                        reader = PdfReader(pdf_file)
                        text_content = ""
                        for page in reader.pages:
                            text_content += page.extract_text() + "\n"
                            
                        # Prepare content for upload as .srt
                        new_filename = file.filename.rsplit('.', 1)[0] + ".srt"
                        content_to_upload = text_content.encode('utf-8')
                        content_type = "text/plain"
                        
                        destination_blob_name = f"{user.id}/{course.id}/user_upload/{new_filename}"
                        
                        await self._storage_repository.upload_file_bytes(
                            destination_blob_name=destination_blob_name,
                            content=content_to_upload,
                            content_type=content_type,
                        )
                    except Exception as e:
                        print(f"Failed to convert PDF {file.filename} to text: {e}")
                        # Fallback or re-raise? For now, return empty string or error message
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Failed to process PDF file {file.filename}.",
                        ) from e
                else:
                    # Should not happen due to validation, but handle logic for non-pdfs if any
                    destination_blob_name = f"{user.id}/{course.id}/user_upload/{file.filename}"
                    await self._storage_repository.upload_file_bytes(
                        destination_blob_name=destination_blob_name,
                        content=content,
                        content_type=file.content_type or "application/octet-stream",
                    )
                    
            except Exception as exc:
                print(f"Failed to upload {file.filename}: {exc}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file {file.filename} to storage.",
                ) from exc
            
        return course

    async def get_all_courses(self, user: UserModel) -> list[CourseModel]:
        # return all the courses for the user
        return await self._repository.get_all_courses_by_userId(user.id)

    async def get_course_by_id(self, course_id: str, user: UserModel) -> CourseModel | None:
        course = await self._repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course with ID {course_id} not found.",
            )
            
        if course.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this course.",
            )
            
        return course

    async def create_message_by_user(self, course_id: str, user: UserModel, content: str) -> MessageModel:
        # 1. Verify course ownership
        course = await self._repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course with ID {course_id} not found.",
            )
            
        if course.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action on this course.",
            )

        # 2. Create and store the user message first
        message_data = MessageModel(
            id="", 
            index=0, 
            course_id=course_id,
            role=Role.USER,
            content=content,
            createdAt=datetime.now(timezone.utc)
        )

        user_message = await self._message_repository.create_message(course_id, message_data)
        
        # 3. Trigger Agent LLM (if configured)
        settings = get_settings()
        if settings.agent_backend_url:
            try:
                # Get all messages including the newly stored user message
                messages = await self._message_repository.get_all_messages_by_course_id(course_id)
                
                # Construct workspace path
                workspace_path = f"/my-project/{course_id}/"
                
                # Prepare payload with existing messages
                message_list_payload = []
                for msg in messages:
                    msg_dict = {
                        "role": msg.role.value,
                        "content": msg.content,
                        "toolCalls": [tc.model_dump() for tc in msg.toolCalls] if msg.toolCalls else None,
                        "toolCallId": msg.toolCallId,
                        "toolName": msg.toolName
                    }
                    message_list_payload.append(msg_dict)

                payload = {
                    "workspace_root_dir_path": workspace_path,
                    "message_list": message_list_payload,
                    "ID": user.id,
                    "SESSION_ID": course_id
                }

                # Send to Agent API
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{settings.agent_backend_url}/chat", 
                        json=payload, 
                        timeout=300.0 
                    )
                    
                    if response.status_code != 200:
                        # something is error
                        print(f"Agent API returned error: {response.text}")
                    else:
                        # Process response
                        data = response.json()
                        new_messages_data = data.get("message_list", [])
                        
                        for msg_data in new_messages_data:
                            # Skip user messages to avoid duplicating the one we just stored
                            role = Role(msg_data["role"])
                            if role == Role.USER:
                                continue

                            new_msg = MessageModel(
                                id="",
                                index=0,
                                course_id=course_id,
                                role=role,
                                content=msg_data.get("content"),
                                toolCalls=msg_data.get("toolCalls"),
                                toolCallId=msg_data.get("toolCallId"),
                                toolName=msg_data.get("toolName"),
                                createdAt=datetime.now(timezone.utc)
                            )
                            await self._message_repository.create_message(course_id, new_msg)
                        
            except Exception as e:
                # Log error but don't fail the user request
                print(f"Failed to trigger agent: {e}")

        return user_message

    async def get_messages_by_course_id(self, course_id: str, user: UserModel) -> list[MessageModel]:
        # 1. Verify course ownership
        course = await self._repository.get_course_by_id(course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course with ID {course_id} not found.",
            )
            
        if course.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action on this course.",
            )
        
        return await self._message_repository.get_all_messages_by_course_id(course_id)

    async def get_course_markdown_files(self, course_id: str, user: UserModel) -> list[str]:
        # 1. Verify course (and ownership)
        # reusing get_course_by_id logic which checks ownership
        await self.get_course_by_id(course_id, user)
        
        prefix = f"{user.id}/{course_id}/"
        
        # 2. Search for markdown files recursively
        files = await self._storage_repository.fuzzy_filename_search_from_storage(
            query="*.md", 
            include_pattern=True, 
            destination_blob_path=prefix
        )
        
        # 3. Strip prefix to return paths relative to course root
        
        relative_files = []
        for f in files:
            if f.startswith(prefix):
                # Strip the prefix
                relative_files.append(f[len(prefix):])
        
        return relative_files

    async def get_course_markdown_file_content(
        self, course_id: str, user: UserModel, path: str
    ) -> str:
        # 1. Verify course ownership (and existence)
        await self.get_course_by_id(course_id, user)

        # 2. Validate path
        if not path.endswith(".md"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid markdown path: must end with .md",
            )

        # Prevent directory traversal attempts
        if ".." in path or "~" in path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid markdown path: directory traversal is not allowed",
            )

        # Normalize leading slash to keep it relative to course root
        normalized_path = path.lstrip("/")

        blob_path = f"{user.id}/{course_id}/{normalized_path}"

        try:
            content = await self._storage_repository.read_file_from_storage_string(
                destination_blob_path=blob_path,
                start_line=None,
                end_line=None,
                page=None,
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Markdown file not found",
            )

        return content

    async def update_course_phase(self, course_id: str, user: UserModel, phase: Phase) -> CourseModel:
        await self.get_course_by_id(course_id, user)
        
        updated_course = await self._repository.update_course_phase(course_id, phase)
        
        if not updated_course:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update course phase.",
            )
            
        return updated_course