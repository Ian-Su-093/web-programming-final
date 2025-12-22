import re
import posixpath
from urllib.parse import unquote

from typing import Any, Optional

from fastapi import HTTPException, status

from repository.storage_repository import StorageRepository


class AgentService:
    def __init__(self, storage_repository: StorageRepository) -> None:
        self._storage_repository = storage_repository

    def _normalize_path(self, path: str) -> str:
        decoded_path = unquote(path)
        
        # Use posixpath.normpath to resolve . and ..
        normalized = posixpath.normpath(decoded_path)
        
        # Handle edge case where normpath returns '.' for empty path or current dir
        if normalized == '.':
            normalized = ''
            
        # Restore trailing slash if the original path intended a directory
        if (decoded_path.endswith('/') or decoded_path.endswith('/.')) and normalized and not normalized.endswith('/'):
            normalized += '/'
            
        return normalized

    async def read_file(self, path: str, start_line: Optional[int], end_line: Optional[int], page: Optional[int]) -> str:
        decoded_path = self._normalize_path(path)
        try:
            return await self._storage_repository.read_file_from_storage_string(
                decoded_path, 
                start_line, 
                end_line, 
                page
            )
        except FileNotFoundError as exc:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found: {decoded_path}"
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading file: {str(exc)}"
            ) from exc

    async def list_directory(self, path: str) -> list[str]:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.list_directory_from_storage(decoded_path)

    async def list_directory_as_tree(self, path: str) -> str:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.list_directory_as_tree_from_storage(decoded_path)

    async def create_file_or_folder(self, path: str) -> None:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.create_directory_file_from_storage(decoded_path)

    async def delete_file_or_folder(self, path: str, recursive: Optional[bool] = False) -> None:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.delete_directory_file_from_storage(decoded_path, recursive)

    async def rewrite_file(self, path: str, content: str) -> None:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.rewrite_file_from_storage(decoded_path, content)

    async def edit_file(self, path: str, search_replace_blocks: str) -> None:
        decoded_path = self._normalize_path(path)
        
        # 1. Read current content
        try:
            content_bytes = await self._storage_repository.read_file_from_storage(decoded_path, None, None, None)
            content_str = content_bytes.decode("utf-8")
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found or unreadable in string format: {decoded_path}"
            ) from exc

        # 2. Parse blocks
        blocks = []

        # 2.1 <|edit_separator|>
        if "<|edit_separator|>" in search_replace_blocks:
            parts = search_replace_blocks.split("<|edit_separator|>")
            if len(parts) >= 2:
                blocks.append((parts[0], parts[1]))
        
        # 2.2 >>>>> / <<<<<
        if not blocks:
            pattern = re.compile(
                r"(?:^|\n)(.*?)\n>>>>>\n(.*?)\n<<<<<", 
                re.DOTALL
            )
            blocks = pattern.findall(search_replace_blocks)
        
        # 2.3 SEARCH / REPLACE
        if not blocks:
            pattern_search_replace = re.compile(
                r"<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE",
                re.DOTALL
            )
            blocks = pattern_search_replace.findall(search_replace_blocks)

        # 2.4 error but tell agent
        if not blocks:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Could not parse search/replace blocks. Supported formats:\n"
                "1. CODE... <|edit_separator|> ...REPLACEMENT\n"
                "2. ...\n>>>>>\n...\n<<<<<\n"
                "3. If search/replace fails, consider using the rewrite_file tool to overwrite the entire file."
            )
        )

        new_content = content_str
        
        for search_block, replace_block in blocks:
            # 3. Apply edit
            
            # Count occurrences
            count = new_content.count(search_block)
            
            if count == 0:
                # Skip if block not found
                continue
            if count > 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Search block found multiple times ({count}), ambiguous edit:\n{search_block}"
                )
            
            new_content = new_content.replace(search_block, replace_block)

        # 4. Write back
        await self._storage_repository.rewrite_file_from_storage(decoded_path, new_content)

    async def search_file_paths(self, query: str, path: str, include_pattern: bool = False) -> list[str]:
        decoded_path = self._normalize_path(path)
        decoded_query = unquote(query)
        return await self._storage_repository.fuzzy_filename_search_from_storage(decoded_query, include_pattern, decoded_path)

    async def grep_file_content(self, query: str, path: str, is_regex: bool = False, page: int | None = None) -> list[str]:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.fuzzy_file_content_search_from_storage(query, is_regex, decoded_path, page)

    async def search_file_offset(self, query: str, path: str, is_regex: bool = False) -> list[dict[str, Any]]:
        decoded_path = self._normalize_path(path)
        return await self._storage_repository.search_file_offset_from_storage(query, decoded_path, is_regex)