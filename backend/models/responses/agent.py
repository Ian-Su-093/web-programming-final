from pydantic import BaseModel, ConfigDict, Field


class FileContentResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "content": "File content here..."
            }
        }
    )
    status: str = Field(default="success", description="Operation status")
    content: str = Field(..., description="File content")


class DirectoryListResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": ["src/", "package.json", "README.md"],
                "raw_output": "src/\npackage.json\nREADME.md"
            }
        }
    )
    items: list[str] = Field(..., description="List of files and directories")
    raw_output: str = Field(..., description="Raw output string (newline separated)")


class DirectoryTreeResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tree": "/project/root\n├── src/\n│   ├── app.ts\n│   └── utils.ts\n└── package.json"
            }
        }
    )
    tree: str = Field(..., description="Tree representation of the directory structure")


class FileSystemOpResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "message": "URI /project/src/new-feature/ successfully created."
            }
        }
    )
    status: str = Field(default="success", description="Operation status")
    message: str = Field(..., description="Success message")


class FileSystemSearchResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "matches": [
                    "/project/src/components/Button.tsx",
                    "/project/src/utils/buttonHelper.ts"
                ]
            }
        }
    )
    matches: list[str] = Field(..., description="List of matching file paths")


class FileSystemSearchContentResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "files": [
                    "/project/src/db/connection.ts",
                    "/project/src/app.ts"
                ],
                "message": "Find 2 matches result in /project/src"
            }
        }
    )
    files: list[str] = Field(..., description="List of files containing the query")
    message: str = Field(..., description="Result message")


class FileSystemSearchOffsetMatch(BaseModel):
    line: int = Field(..., description="Line number (1-based)")
    content: str = Field(..., description="Content of the line")


class FileSystemSearchOffsetResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "matches": [
                    {
                        "line": 10,
                        "content": "const db = connectToDatabase();"
                    }
                ],
                "formatted_output": "Line 10:\n```\nconst db = connectToDatabase();\n```"
            }
        }
    )
    matches: list[FileSystemSearchOffsetMatch] = Field(..., description="List of matches with line numbers")
    formatted_output: str = Field(..., description="Formatted string output of matches")
