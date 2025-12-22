from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, Request, UploadFile, status

from config.settings import Settings, get_settings
from core.database import get_firestore_client
from core.storage import get_storage_client
from decorators.auth import required_login
from models.course import Phase
from models.requests.course import CreateMessageRequest
from models.responses.course import (
    CourseResponse,
    MultipleCourseResponse,
    CourseDetailResponse,
    MultipleMessageResponse,
    SingleMessageResponse,
    CourseMarkdownFilesResponse,
    CourseMarkdownFileContentResponse,
)
from models.responses.error import ErrorResponse
from models.user import UserModel
from repository.course_repository import CourseRepository
from repository.message_repository import MessageRepository
from repository.storage_repository import StorageRepository
from services.course_service import CourseService

router = APIRouter(prefix="/course", tags=["Courses"])



def get_course_repository(
    settings: Settings = Depends(get_settings),
) -> CourseRepository:
    client = get_firestore_client(
        project_id=settings.firebase_project_id,
        credentials_file=settings.firebase_credentials_file,
    )
    return CourseRepository(client=client, collection="course")


def get_storage_repository(
    settings: Settings = Depends(get_settings),
) -> StorageRepository:
    if not settings.gcs_bucket_name:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GCS_BUCKET_NAME is not configured.",
        )

    client = get_storage_client(
        project_id=settings.firebase_project_id,
        credentials_file=settings.firebase_credentials_file,
    )
    return StorageRepository(client=client, bucket_name=settings.gcs_bucket_name)


def get_message_repository(
    settings: Settings = Depends(get_settings),
) -> MessageRepository:
    client = get_firestore_client(
        project_id=settings.firebase_project_id,
        credentials_file=settings.firebase_credentials_file,
    )
    return MessageRepository(client=client, collection="message")

def get_course_service(
    repository: CourseRepository = Depends(get_course_repository),
    storage_repository: StorageRepository = Depends(get_storage_repository),
    message_repository: MessageRepository = Depends(get_message_repository),
) -> CourseService:
    return CourseService(repository, storage_repository, message_repository)


@router.post(
    "",
    summary="Create a new course",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": ErrorResponse,
            "description": "Invalid file format (only PDF allowed)",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ErrorResponse,
            "description": "Server configuration error (e.g. missing GCS bucket)",
        }
    },
)
@required_login
async def create_course(
    request: Request,
    course_name: Annotated[str, Form(description="Name of the course")],
    files: Annotated[list[UploadFile], File(description="Course materials (PDF only)")],
    service: CourseService = Depends(get_course_service),
) -> CourseResponse:
    
    user_dict = request.session["user"]
    user = UserModel(**user_dict)
    
    course = await service.create_course(user, course_name, files)
    return CourseResponse(status="success", course=course)

@router.get(
    "",
    summary="Get all courses",
    response_model=MultipleCourseResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def get_all_courses(
    request: Request,
    service: CourseService = Depends(get_course_service),
) -> MultipleCourseResponse:

    user_dict = request.session["user"]
    user = UserModel(**user_dict)

    courses = await service.get_all_courses(user)

    return MultipleCourseResponse(status="success", courses=courses)

@router.get(
    "/{course_id}",
    summary="Get a course by ID",
    response_model=CourseDetailResponse,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def get_course_by_id(
    request: Request,
    course_id: str,
    service: CourseService = Depends(get_course_service),
) -> CourseDetailResponse:
    
    user_dict = request.session["user"]
    user = UserModel(**user_dict)
    
    course = await service.get_course_by_id(course_id, user)
    messages = await service.get_messages_by_course_id(course_id, user)
    
    return CourseDetailResponse(
        status="success",
        # course is guaranteed to be not None here because service raises 404 otherwise
        course=course, # type: ignore
        messages=messages
    )

@router.put(
    "/{course_id}/phase",
    summary="Update course phase",
    response_model=CourseResponse,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def update_course_phase(
    request: Request,
    course_id: str,
    phase: Phase = Query(..., description="New phase for the course (markdown or website)"),
    service: CourseService = Depends(get_course_service),
) -> CourseResponse:
    
    user_dict = request.session["user"]
    user = UserModel(**user_dict)
    
    course = await service.update_course_phase(course_id, user, phase)
    return CourseResponse(status="success", course=course)

@router.get(
    "/{course_id}/message",
    summary="Get all messages by course ID",
    response_model=MultipleMessageResponse,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def get_messages_by_course_id(
    request: Request,
    course_id: str,
    service: CourseService = Depends(get_course_service),
) -> MultipleMessageResponse:
    
    user_dict = request.session["user"]
    user = UserModel(**user_dict)
    
    messages = await service.get_messages_by_course_id(course_id, user)
    return MultipleMessageResponse(status="success", messages=messages)

@router.post(
    "/{course_id}/message",
    summary="Create a new message by user",
    response_model=SingleMessageResponse,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def create_message_by_user(
    request: Request,
    course_id: str,
    payload: CreateMessageRequest,
    background_tasks: BackgroundTasks,
    service: CourseService = Depends(get_course_service),
) -> SingleMessageResponse:
    
    user_dict = request.session["user"]
    user = UserModel(**user_dict)
    
    message = await service.create_message_by_user(course_id, user, payload.content, background_tasks)
    
    return SingleMessageResponse(status="success", message=message)

@router.get(
    "/{course_id}/files/markdown",
    summary="Get all markdown files in a course",
    response_model=CourseMarkdownFilesResponse,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def get_course_markdown_files(
    request: Request,
    course_id: str,
    service: CourseService = Depends(get_course_service),
) -> CourseMarkdownFilesResponse:
    
    user_dict = request.session["user"]
    user = UserModel(**user_dict)

    markdown_files = await service.get_course_markdown_files(course_id, user)

    return CourseMarkdownFilesResponse(
        status="success",
        markdown_name_list=markdown_files,
    )


@router.get(
    "/{course_id}/files/markdown/content",
    summary="Get markdown file content in a course",
    response_model=CourseMarkdownFileContentResponse,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Markdown file not found or course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_400_BAD_REQUEST: {
            "model": ErrorResponse,
            "description": "Invalid markdown path",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        },
    },
)
@required_login
async def get_course_markdown_file_content(
    request: Request,
    course_id: str,
    path: str,
    service: CourseService = Depends(get_course_service),
) -> CourseMarkdownFileContentResponse:

    user_dict = request.session["user"]
    user = UserModel(**user_dict)

    content = await service.get_course_markdown_file_content(course_id, user, path)

    return CourseMarkdownFileContentResponse(status="success", content=content)

@router.get(
    "/{course_id}/react",
    summary="Get react files for the course",
    response_model=dict[str, str],
     responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Course not found",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "User does not have permission to access this course",
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "User not authenticated",
        }
    }
)
@required_login
async def get_react_files(
    request: Request,
    course_id: str,
    service: CourseService = Depends(get_course_service),
) -> dict[str, str]:
    user_dict = request.session["user"]
    user = UserModel(**user_dict)
    
    return await service.get_react_files(course_id, user)
