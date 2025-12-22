from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": "Error Message here!"
            }
        }
    )
    detail: str = Field(..., description="Error detail message")

