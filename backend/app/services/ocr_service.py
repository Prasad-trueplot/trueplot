from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path

from app.models.enums import DocumentType

try:
    from PIL import Image
except ImportError:  # pragma: no cover - Docker image installs Pillow
    Image = None  # type: ignore[assignment]

try:
    import pytesseract
except ImportError:  # pragma: no cover - Docker image installs pytesseract
    pytesseract = None  # type: ignore[assignment]

try:
    from pdf2image import convert_from_path
except ImportError:  # pragma: no cover - Docker image installs pdf2image
    convert_from_path = None  # type: ignore[assignment]

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - Docker image installs pypdf
    PdfReader = None  # type: ignore[assignment]


SUPPORTED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}
SUPPORTED_DOCUMENT_SUFFIXES = SUPPORTED_IMAGE_SUFFIXES | {".pdf"}


@dataclass(slots=True)
class OcrExtractionResult:
    extracted_text: str
    ocr_extraction_status: str
    ocr_extraction_method: str
    ocr_extraction_error: str | None


def extract_document_text(
    *,
    file_path: Path,
    original_filename: str,
    document_type: DocumentType,
    content_type: str | None,
) -> OcrExtractionResult:
    suffix = file_path.suffix.lower()
    if suffix and suffix not in SUPPORTED_DOCUMENT_SUFFIXES:
        return _failed_result(
            original_filename=original_filename,
            document_type=document_type,
            reason=f"Unsupported file format: {suffix or 'unknown'}",
        )

    if suffix in SUPPORTED_IMAGE_SUFFIXES or (content_type or "").startswith("image/"):
        return _extract_from_image(file_path, original_filename, document_type)

    if suffix == ".pdf" or content_type == "application/pdf":
        return _extract_from_pdf(file_path, original_filename, document_type)

    return _mock_result(
        original_filename=original_filename,
        document_type=document_type,
        reason="Unsupported or missing content type; using mock extraction mode.",
    )


def _extract_from_image(
    file_path: Path, original_filename: str, document_type: DocumentType
) -> OcrExtractionResult:
    if Image is None or pytesseract is None:
        return _mock_result(
            original_filename=original_filename,
            document_type=document_type,
            reason="Pillow or pytesseract is unavailable; using mock extraction mode.",
        )

    if shutil.which("tesseract") is None:
        return _mock_result(
            original_filename=original_filename,
            document_type=document_type,
            reason="Tesseract binary is unavailable; using mock extraction mode.",
        )

    try:
        with Image.open(file_path) as image:
            text = pytesseract.image_to_string(image, config="--psm 6")
    except Exception as exc:  # pragma: no cover - OCR runtime errors
        return _failed_result(
            original_filename=original_filename,
            document_type=document_type,
            reason=f"Image OCR failed: {exc}",
        )

    cleaned_text = _clean_text(text)
    if not cleaned_text:
        return _mock_result(
            original_filename=original_filename,
            document_type=document_type,
            reason="Image OCR returned no text; using mock extraction mode.",
        )

    return OcrExtractionResult(
        extracted_text=cleaned_text,
        ocr_extraction_status="completed",
        ocr_extraction_method="tesseract",
        ocr_extraction_error=None,
    )


def _extract_from_pdf(
    file_path: Path, original_filename: str, document_type: DocumentType
) -> OcrExtractionResult:
    if convert_from_path is None or Image is None or pytesseract is None:
        return _mock_result(
            original_filename=original_filename,
            document_type=document_type,
            reason="PDF OCR dependencies are unavailable; using mock extraction mode.",
        )

    if shutil.which("tesseract") is None:
        return _mock_result(
            original_filename=original_filename,
            document_type=document_type,
            reason="Tesseract binary is unavailable; using mock extraction mode.",
        )

    try:
        pages = convert_from_path(str(file_path), dpi=200, first_page=1, last_page=5)
        ocr_text = "\n\n".join(
            _clean_text(pytesseract.image_to_string(page, config="--psm 6"))
            for page in pages
        )
    except Exception as exc:  # pragma: no cover - PDF OCR runtime errors
        native_text = _extract_pdf_native_text(file_path)
        if native_text:
            return OcrExtractionResult(
                extracted_text=native_text,
                ocr_extraction_status="completed",
                ocr_extraction_method="pdf-native-text",
                ocr_extraction_error=None,
            )
        return _mock_result(
            original_filename=original_filename,
            document_type=document_type,
            reason=f"PDF OCR failed: {exc}",
        )

    cleaned_text = _clean_text(ocr_text)
    if cleaned_text:
        return OcrExtractionResult(
            extracted_text=cleaned_text,
            ocr_extraction_status="completed",
            ocr_extraction_method="tesseract",
            ocr_extraction_error=None,
        )

    native_text = _extract_pdf_native_text(file_path)
    if native_text:
        return OcrExtractionResult(
            extracted_text=native_text,
            ocr_extraction_status="completed",
            ocr_extraction_method="pdf-native-text",
            ocr_extraction_error=None,
        )

    return _mock_result(
        original_filename=original_filename,
        document_type=document_type,
        reason="PDF OCR produced no text; using mock extraction mode.",
    )


def _extract_pdf_native_text(file_path: Path) -> str:
    if PdfReader is None:
        return ""

    try:
        reader = PdfReader(str(file_path))
    except Exception:  # pragma: no cover - PDF parsing errors
        return ""

    chunks: list[str] = []
    for page_index in range(min(len(reader.pages), 5)):
        try:
            chunks.append(reader.pages[page_index].extract_text() or "")
        except Exception:  # pragma: no cover - page parse errors
            continue

    return _clean_text("\n".join(chunks))


def _mock_result(
    *,
    original_filename: str,
    document_type: DocumentType,
    reason: str,
) -> OcrExtractionResult:
    fallback_text = (
        f"Mock OCR extraction for {document_type.value}. "
        f"Filename: {original_filename}. "
        f"{reason} "
        "Use the original file for manual review."
    )
    return OcrExtractionResult(
        extracted_text=fallback_text,
        ocr_extraction_status="completed",
        ocr_extraction_method="mock",
        ocr_extraction_error=None,
    )


def _failed_result(
    *,
    original_filename: str,
    document_type: DocumentType,
    reason: str,
) -> OcrExtractionResult:
    return OcrExtractionResult(
        extracted_text="",
        ocr_extraction_status="failed",
        ocr_extraction_method="none",
        ocr_extraction_error=(
            f"OCR extraction failed for {document_type.value} ({original_filename}): {reason}"
        ),
    )


def _clean_text(value: str) -> str:
    text = " ".join(value.split())
    return text[:12000]
