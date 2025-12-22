from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Theme(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"


class Language(str, Enum):
    EN = "en"
    ZH_TW = "zh-TW"


class UserPreference(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    theme: Theme = Field(default=Theme.SYSTEM, description="User theme preference")
    language: Language = Field(default=Language.ZH_TW, description="User language preference")


# For OAuth data
class UserProfile(BaseModel):

    model_config = ConfigDict(extra="ignore")

    provider: str = Field(..., description="OAuth provider (google/github)")
    provider_id: str = Field(..., description="Unique ID from the provider")
    email: str | None = Field(None, description="User email")
    name: str | None = Field(None, description="User display name")
    picture: str | None = Field(None, description="Avatar URL")


# For database schema (Full DB Model)
class UserModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Internal Firestore document ID")
    provider_id: str = Field(..., description="Unique ID from the provider")
    provider: str = Field(..., description="OAuth provider (google/github)")
    email: str = Field(..., description="User email")
    name: str | None = Field(None, description="User display name")
    picture: str | None = Field(None, description="Avatar URL")
    preferences: UserPreference = Field(
        default_factory=UserPreference,
        description="User interface preferences",
    )
    created_at: datetime = Field(..., description="Timestamp of user creation")
    updated_at: datetime = Field(..., description="Timestamp of user last update")


# Safe subset for API responses (Excludes provider details)
class UserResponseModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="User ID")
    email: str | None = Field(None, description="User email")
    name: str | None = Field(None, description="User display name")
    picture: str | None = Field(None, description="Avatar URL")
    preferences: UserPreference = Field(..., description="User preferences")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
