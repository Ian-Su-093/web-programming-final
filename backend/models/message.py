from enum import Enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"

class ToolCallFunction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    name: str = Field(..., description="Tool function name")
    arguments: str = Field(..., description="Tool function arguments (JSON string)")

class ToolCallModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: str = Field(default="function", description="Tool call type")
    function: ToolCallFunction = Field(..., description="Tool call function details")

class MessageModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Message ID")
    index: int = Field(..., description="Message index")
    course_id: str = Field(..., description="Course ID")
    role: Role = Field(..., description="Message role")
    content: Optional[str] = Field(None, description="Message content")

    toolCalls: Optional[list[ToolCallModel]] = Field(None, description="Tool calls")

    toolCallId: Optional[str] = Field(None, description="Tool call ID")
    toolName: Optional[str] = Field(None, description="Tools Name")

    createdAt: datetime = Field(..., description="Message created at")
