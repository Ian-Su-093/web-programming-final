from pydantic import BaseModel, ConfigDict, Field

from models.user import UserResponseModel

user_template_example = {
    "id": "1234567890",
    "email": "test@example.com",
    "name": "Test User",
    "picture": "https://example.com/picture.jpg",
    "preferences": {
        "theme": "system",
        "language": "zh-TW"
    },
    "created_at": "2025-01-01T00:00:00.000000+00:00",
    "updated_at": "2025-01-01T00:00:00.000000+00:00",
}

class UserResponse(BaseModel):

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "user": user_template_example
            }
        }
    )

    status: str = Field(
        ...,
        description="Status of the user response. 'success' if the user was found or created, 'error' if there was an issue.",
        example="success",
    )
    user: UserResponseModel | None = Field(
        ...,
        description="User data (safe subset).",
        example=user_template_example,
    )
