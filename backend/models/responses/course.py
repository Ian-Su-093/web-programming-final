from pydantic import BaseModel, ConfigDict, Field
from models.course import CourseModel
from models.message import MessageModel


class CourseResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "course": {
                    "id": "course-123",
                    "name": "Web Programming",
                    "owner_id": "user-123",
                    "created_at": "2025-01-01T00:00:00.000000+00:00",
                    "updated_at": "2025-01-01T00:00:00.000000+00:00",
                    "phase": "markdown"
                }
            }
        }
    )

    status: str = Field(..., description="Response status", example="success")
    course: CourseModel = Field(..., description="Course data")

class MultipleCourseResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "courses": [
                    {
                        "id": "course-123",
                        "name": "Web Programming",
                        "owner_id": "user-123",
                        "created_at": "2025-01-01T00:00:00.000000+00:00",
                        "updated_at": "2025-01-01T00:00:00.000000+00:00",
                        "phase": "markdown"
                    },
                    {
                        "id": "course-456",
                        "name": "Data Structures",
                        "owner_id": "user-123",
                        "created_at": "2025-01-01T00:00:00.000000+00:00",
                        "updated_at": "2025-01-01T00:00:00.000000+00:00",
                        "phase": "website"
                    }
                ]
            }
        }
    )

    status: str = Field(..., description="Response status", example="success")
    courses: list[CourseModel] = Field(..., description="List of courses")


class CourseDetailResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "course": {
                    "id": "course-123",
                    "name": "Web Programming",
                    "owner_id": "user-123",
                    "created_at": "2025-01-01T00:00:00.000000+00:00",
                    "updated_at": "2025-01-01T00:00:00.000000+00:00",
                    "phase": "markdown"
                },
                "messages": [
                    {
                        "id": "msg-1",
                        "index": 0,
                        "course_id": "course-123",
                        "role": "user",
                        "content": "Hello",
                        "createdAt": "2025-01-01T00:00:00.000000+00:00"
                    }
                ]
            }
        }
    )
    
    status: str = Field(..., description="Response status", example="success")
    course: CourseModel = Field(..., description="Course data")
    messages: list[MessageModel] = Field(..., description="List of messages for the course")

class MultipleMessageResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "messages": [
                    {
                        "id": "msg-1",
                        "index": 0,
                        "course_id": "course-123",
                        "role": "user",
                        "content": "Hello",
                        "createdAt": "2025-01-01T00:00:00.000000+00:00"
                    }
                ]
            }
        }
    )
    
    status: str = Field(..., description="Response status", example="success")
    messages: list[MessageModel] = Field(..., description="List of messages for the course")

class SingleMessageResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "message": {
                    "id": "msg-1",
                    "index": 0,
                    "course_id": "course-123",
                    "role": "user",
                    "content": "Hello",
                    "createdAt": "2025-01-01T00:00:00.000000+00:00"
                }
            }
        }
    )
    
    status: str = Field(..., description="Response status", example="success")
    message: MessageModel = Field(..., description="Created message")

class CourseMarkdownFilesResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "markdown_name_list": [
                    "week1/notes.md",
                    "week2/lecture.md"
                ]
            }
        }
    )

    status: str = Field(..., description="Response status", example="success")
    markdown_name_list: list[str] = Field(
        ..., description="List of markdown file names within the course"
    )


class CourseMarkdownFileContentResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "content": "# Week 1 Notes\n\nThis is the content of the markdown file.",
            }
        }
    )

    status: str = Field(..., description="Response status", example="success")
    content: str = Field(..., description="Markdown file content as a string")