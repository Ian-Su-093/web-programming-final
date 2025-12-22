from pydantic import BaseModel, ConfigDict, Field

from models.user import Theme, Language

class UserPreferenceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    theme: Theme = Field(..., description="User theme preference")
    language: Language = Field(..., description="User language preference")