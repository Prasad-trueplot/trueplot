from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"


class StoredFile:
    def __init__(
        self,
        *,
        original_filename: str,
        stored_filename: str,
        content_type: str | None,
        file_size_bytes: int,
        file_path: Path,
    ) -> None:
        self.original_filename = original_filename
        self.stored_filename = stored_filename
        self.content_type = content_type
        self.file_size_bytes = file_size_bytes
        self.file_path = file_path

    @property
    def relative_path(self) -> str:
        return str(Path("uploads") / self.stored_filename)


def _safe_suffix(filename: str) -> str:
    suffix = Path(filename).suffix
    return suffix if len(suffix) <= 20 else ""


async def save_upload_file(upload: UploadFile) -> StoredFile:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    original_filename = upload.filename or "uploaded-document"
    stored_filename = f"{uuid4().hex}{_safe_suffix(original_filename)}"
    file_path = UPLOAD_DIR / stored_filename
    file_size_bytes = 0

    with file_path.open("wb") as destination:
        while chunk := await upload.read(1024 * 1024):
            file_size_bytes += len(chunk)
            destination.write(chunk)

    await upload.close()

    return StoredFile(
        original_filename=original_filename,
        stored_filename=stored_filename,
        content_type=upload.content_type,
        file_size_bytes=file_size_bytes,
        file_path=file_path,
    )

