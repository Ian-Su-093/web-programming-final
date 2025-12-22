from pydantic import BaseModel, ConfigDict, Field


class CreateMessageRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "content": "Hello, can you help me with this course?"
            }
        }
    )
    content: str = Field(..., description="Message content")

