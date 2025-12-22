from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field

class Phase(str, Enum):
    MARKDOWN = "markdown"
    WEBSITE = "website"

class CourseModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Course ID")
    name: str = Field(..., description="Course Name")
    owner_id: str = Field(..., description="Owner ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    phase: Phase = Field(default=Phase.MARKDOWN, description="Course phase")

