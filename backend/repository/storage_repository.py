from __future__ import annotations

import asyncio
from typing import Any, BinaryIO

from google.cloud import storage
import fnmatch
import re

class StorageRepository:

    def __init__(
        self,
        client: storage.Client,
        bucket_name: str,
    ) -> None:
        self._client = client
        self._bucket_name = bucket_name

    async def upload_file(self, destination_blob_name: str, file_obj: BinaryIO, content_type: str) -> str:
        
        def _sync_upload() -> str:
            bucket = self._client.bucket(self._bucket_name)
            blob = bucket.blob(destination_blob_name)
            
            # Rewind file to beginning just in case
            file_obj.seek(0)
            
            blob.upload_from_file(file_obj, content_type=content_type)
            
            return f"gs://{self._bucket_name}/{destination_blob_name}"

        return await asyncio.to_thread(_sync_upload)

    async def upload_file_bytes(self, destination_blob_name: str, content: bytes, content_type: str) -> str:
        
        def _sync_upload_bytes() -> str:
            bucket = self._client.bucket(self._bucket_name)
            blob = bucket.blob(destination_blob_name)
            
            blob.upload_from_string(content, content_type=content_type)
            
            return f"gs://{self._bucket_name}/{destination_blob_name}"

        return await asyncio.to_thread(_sync_upload_bytes)

    async def read_file_from_storage_string(self, destination_blob_path: str, start_line: int | None, end_line: int | None, page: int | None) -> str:
        
        def _sync_read_file_from_storage_string() -> str:
            bucket = self._client.bucket(self._bucket_name)
            
            path = destination_blob_path.lstrip('/')
            
            blob = bucket.blob(path)
            
            # Check if file exists
            if not blob.exists():
                raise FileNotFoundError(f"File not found: {path}")

            content_bytes = blob.download_as_bytes()
            
            # Handle text files (assume utf-8)
            try:
                text_content = content_bytes.decode('utf-8')
                
                # Apply line slicing if requested
                if start_line is not None or end_line is not None:
                    lines = text_content.split('\n')
                    # Adjust for 1-based indexing if needed, but usually slice is 0-based in python
                    # Assuming start_line/end_line are 1-based for user friendliness, convert to 0-based
                    start = (start_line - 1) if start_line is not None and start_line > 0 else 0
                    end = end_line if end_line is not None else len(lines)
                    
                    return "\n".join(lines[start:end])
                
                return text_content
            except UnicodeDecodeError:
                # Binary file that is not PDF
                return "[Binary content]"

        return await asyncio.to_thread(_sync_read_file_from_storage_string)

    async def read_file_from_storage(self, destination_blob_path: str, start_line: int | None, end_line: int | None, page: int | None) -> bytes:

        def _sync_read_file_from_storage() -> bytes:
            bucket = self._client.bucket(self._bucket_name)
            
            # Remove leading slash if present to be flexible
            path = destination_blob_path.lstrip('/')
            
            blob = bucket.blob(path)
            
            content = blob.download_as_bytes()
            
            return content[start_line:end_line]

        return await asyncio.to_thread(_sync_read_file_from_storage)

    async def list_directory_from_storage(self, destination_blob_path: str) -> list[str]:

        def _sync_list_directory_from_storage() -> list[str]:
            bucket = self._client.bucket(self._bucket_name)
            
            # Remove leading slash if present to be flexible
            prefix = destination_blob_path.lstrip('/')
            
            # Ensure prefix ends with / if we are treating it as a folder, unless it's empty (root)
            if prefix and not prefix.endswith("/"):
                prefix += "/"
                
            # Using delimiter='/' mimics a filesystem listing (non-recursive)
            blobs = bucket.list_blobs(prefix=prefix, delimiter="/")
            
            items = []
            # Iterate through blobs (files)
            for blob in blobs:
                name = blob.name
                if name.startswith(prefix):
                    name = name[len(prefix):]
                if name:  # Exclude the directory blob itself or empty strings
                    items.append(name)
            
            # Iterate through prefixes (directories)
            # Note: blobs.prefixes is populated only after iterating through blobs
            if blobs.prefixes:
                for p in blobs.prefixes:
                    name = p
                    if name.startswith(prefix):
                        name = name[len(prefix):]
                    items.append(name)
            
            return sorted(items)

        return await asyncio.to_thread(_sync_list_directory_from_storage)
    
    async def list_directory_as_tree_from_storage(self, destination_blob_path: str) -> str:
        
        def _sync_list_directory_as_tree() -> str:
            bucket = self._client.bucket(self._bucket_name)
            
            # Remove leading slash if present to be flexible
            prefix = destination_blob_path.lstrip('/')
            
            blobs = list(bucket.list_blobs(prefix=prefix))
            
            if not blobs:
                return ""
                
            # Build directory tree
            tree: dict[str, Any] = {}
            for blob in blobs:
                # Get relative path
                name = blob.name
                if name.startswith(prefix):
                    rel_path = name[len(prefix):]
                    # Remove leading slash if present
                    if rel_path.startswith("/"):
                        rel_path = rel_path[1:]
                    
                    if not rel_path:
                        continue
                        
                    parts = [p for p in rel_path.split("/") if p]
                    current = tree
                    for part in parts:
                        if part not in current:
                            current[part] = {}
                        current = current[part]
            
            # Generate tree string
            lines = [prefix if prefix else "."]
            
            def _build_tree_string(node: dict[str, Any], prefix_str: str = ""):
                entries = sorted(node.keys())
                for i, entry in enumerate(entries):
                    is_last = i == len(entries) - 1
                    connector = "└── " if is_last else "├── "
                    lines.append(f"{prefix_str}{connector}{entry}")
                    
                    children = node[entry]
                    if children:
                        extension = "    " if is_last else "│   "
                        _build_tree_string(children, prefix_str + extension)
            
            _build_tree_string(tree)
            return "\n".join(lines)

        return await asyncio.to_thread(_sync_list_directory_as_tree)

    async def create_directory_file_from_storage(self, destination_blob_path: str) -> None:
        
        def _sync_create_directory_file() -> None:
            bucket = self._client.bucket(self._bucket_name)

            path = destination_blob_path.lstrip('/')

            blob = bucket.blob(path)

            blob.upload_from_string(b'', content_type='application/x-www-form-urlencoded;charset=UTF-8')

        return await asyncio.to_thread(_sync_create_directory_file)

    async def delete_directory_file_from_storage(self, destination_blob_path: str, recursive: bool = False) -> None:

        def _sync_delete_directory_file() -> None:
            bucket = self._client.bucket(self._bucket_name)
            
            # Remove leading slash
            path = destination_blob_path.lstrip('/')
            
            if path.endswith('/'):
                # It is a folder, delete all blobs with this prefix
                blobs = list(bucket.list_blobs(prefix=path))
                if blobs:
                    bucket.delete_blobs(blobs)
                # Also try to delete the "folder marker" object itself if it exists (it was included in list_blobs if it matches prefix)
            else:
                # It might be a file or a folder path without trailing slash.
                # First try to delete as a single object (file)
                blob = bucket.blob(path)
                if blob.exists():
                    blob.delete()
                else:
                    # If it doesn't exist as a file, check if it is a folder (prefix)
                    # Appending '/' to treat as folder
                    folder_prefix = path + '/'
                    blobs = list(bucket.list_blobs(prefix=folder_prefix))
                    if blobs:
                         bucket.delete_blobs(blobs)

        return await asyncio.to_thread(_sync_delete_directory_file)

    async def rewrite_file_from_storage(self, destination_blob_path: str, content: str) -> None:

        def _sync_rewrite_file() -> None:
            bucket = self._client.bucket(self._bucket_name)

            path = destination_blob_path.lstrip('/')

            blob = bucket.blob(path)

            blob.upload_from_string(content, content_type='application/octet-stream')

        return await asyncio.to_thread(_sync_rewrite_file)

    async def fuzzy_filename_search_from_storage(self, query: str, include_pattern: bool, destination_blob_path: str) -> list[str]:

        def _sync_fuzzy_filename_search() -> list[str]:
            bucket = self._client.bucket(self._bucket_name)

            prefix = destination_blob_path.lstrip('/')

            blobs = list(bucket.list_blobs(prefix=prefix))

            results = []
            for blob in blobs:
                name = blob.name
                
                if include_pattern:
                    # fnmatch matches against the whole string if no path separators, but we want recursive search.
                    if fnmatch.fnmatch(name, query):
                        results.append(name)
                else:
                    # Simple substring match
                    if query in name:
                        results.append(name)
            
            return results

        return await asyncio.to_thread(_sync_fuzzy_filename_search)

    async def fuzzy_file_content_search_from_storage(self, query: str, is_regex: bool, destination_blob_path: str, page: int | None) -> list[str]:

        def _sync_fuzzy_file_content_search() -> list[str]:

            bucket = self._client.bucket(self._bucket_name)

            prefix = destination_blob_path.lstrip('/')

            blobs = list(bucket.list_blobs(prefix=prefix))

            results = []
            
            # Pre-compile regex if needed
            regex_pattern = None
            if is_regex:
                try:
                    regex_pattern = re.compile(query)
                except re.error:
                    # If regex is invalid, return empty or handle error. For now return empty.
                    return []

            for blob in blobs:
                # Skip if it looks like a "directory" marker
                if blob.name.endswith('/'):
                    continue
                
                try:
                    # Download content as string (assuming utf-8 text files)
                    content = blob.download_as_text()
                except Exception:
                    # If file is not text (e.g. binary), skip it
                    continue
                
                if is_regex and regex_pattern:
                    if regex_pattern.search(content):
                        results.append(blob.name)
                else:
                    if query in content:
                        results.append(blob.name)
            
            return results

        return await asyncio.to_thread(_sync_fuzzy_file_content_search)

    async def search_file_offset_from_storage(self, query: str, destination_blob_path: str, is_regex: bool) -> list[dict[str, Any]]:
        def _sync_search_file_offset() -> list[dict[str, Any]]:
            bucket = self._client.bucket(self._bucket_name)

            # Remove leading slash
            path = destination_blob_path.lstrip('/')
            
            blob = bucket.blob(path)
            
            if not blob.exists():
                return []
                
            # Skip "directory" markers
            if path.endswith('/'):
                return []

            try:
                content = blob.download_as_text()
            except Exception:
                return []

            lines = content.split('\n')
            results = []
            
            regex_pattern = None
            if is_regex:
                try:
                    regex_pattern = re.compile(query)
                except re.error:
                    return []

            for i, line in enumerate(lines):
                match = False
                if is_regex and regex_pattern:
                    if regex_pattern.search(line):
                        match = True
                else:
                    if query in line:
                        match = True
                
                if match:
                    results.append({
                        "line": i + 1, # 1-based index
                        "content": line
                    })
            
            return results

        return await asyncio.to_thread(_sync_search_file_offset)