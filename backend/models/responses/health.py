from pydantic import BaseModel, ConfigDict, Field


class HealthStatusResponse(BaseModel):

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"status": "ok", "detail": "All subsystems operational."}
        }
    )

    status: str = Field(
        ...,
        description="Current availability of the backend service.",
        example="ok",
    )
    detail: str | None = Field(
        default=None,
        description="Optional additional diagnostic information.",
        example="All subsystems operational.",
    )

