from dataclasses import dataclass

from app.core.config import settings
from app.models.property import Property
from app.models.property_document import PropertyDocument
from app.services.prompts import AI_LEGAL_SUMMARY_PROMPT_TEMPLATE

DISCLAIMER = (
    "AI-assisted summary for preliminary review only. This is not final legal "
    "advice and must be reviewed by a qualified legal or land-record professional."
)


@dataclass
class LegalSummaryResult:
    content: str
    english_summary: str
    telugu_summary: str
    ownership_summary: str
    document_insights: str
    risk_flags: str
    recommended_next_steps: str
    disclaimer: str
    model_name: str
    is_mock: bool


def build_legal_summary_prompt(
    document: PropertyDocument,
    property_record: Property,
) -> str:
    extracted_text = (
        document.extracted_text or "No OCR text available; use uploaded metadata only."
    )
    return AI_LEGAL_SUMMARY_PROMPT_TEMPLATE.format(
        document_type=document.document_type.value,
        filename=document.original_filename or document.file_name,
        ocr_extraction_status=document.ocr_extraction_status,
        ocr_extraction_method=document.ocr_extraction_method or "unknown",
        property_title=property_record.title,
        district=property_record.district or "Not provided",
        mandal=property_record.mandal or "Not provided",
        village=property_record.village or "Not provided",
        survey_number=property_record.survey_number or "Not provided",
        extracted_text=extracted_text[:4000],
    )


def generate_legal_summary(
    document: PropertyDocument,
    property_record: Property,
) -> LegalSummaryResult:
    if settings.openai_api_key:
        return _generate_openai_placeholder_summary(document, property_record)

    return _generate_mock_summary(document, property_record)


def _generate_mock_summary(
    document: PropertyDocument,
    property_record: Property,
) -> LegalSummaryResult:
    doc_type = document.document_type.value
    location = ", ".join(
        part
        for part in [
            property_record.village,
            property_record.mandal,
            property_record.district,
        ]
        if part
    )
    survey_number = property_record.survey_number or "not provided"

    english_summary = (
        f"AI-assisted mock summary for {doc_type}. OCR text was "
        f"{'extracted and used' if document.extracted_text else 'not available; fallback metadata was used'}. "
        f"The document is linked to {property_record.title} at "
        f"{location or 'location not provided'}, survey number {survey_number}."
    )
    telugu_summary = (
        "AI సహాయంతో రూపొందించిన స్థానిక MVP సారాంశం. ఈ పత్రం భూమి వివరాలు, "
        "యాజమాన్య సూచనలు, మరియు తదుపరి మానవ సమీక్ష కోసం ఉపయోగించాలి."
    )
    ownership_summary = (
        "Ownership indicators should be reviewed against registered owner names, "
        "survey number continuity, and supporting revenue records."
    )
    document_insights = (
        f"Uploaded file '{document.original_filename or document.file_name}' is stored "
        f"locally as '{document.stored_filename or 'not available'}'. "
        f"OCR status: {document.ocr_extraction_status}. "
        f"OCR method: {document.ocr_extraction_method or 'not available'}. "
        f"{'Extracted OCR text is available for downstream review.' if document.extracted_text else 'No OCR text available; metadata-only fallback was used.'}"
    )
    risk_flags = (
        f"{'OCR extracted text should still be manually reviewed against the original file.' if document.extracted_text else 'OCR text was not extracted; verify the uploaded file manually.'} "
        "Verify EC chain, 1B/Adangal consistency, survey boundaries, encumbrances, and seller authority manually."
    )
    recommended_next_steps = (
        "Review original document, compare with EC/1B/Adangal/FMB records, validate survey "
        "number and extent, and obtain legal review before any transaction decision."
    )
    content = "\n\n".join(
        [
            f"English Summary: {english_summary}",
            f"Telugu Summary: {telugu_summary}",
            f"Ownership Summary: {ownership_summary}",
            f"Document Insights: {document_insights}",
            f"Risk Flags: {risk_flags}",
            f"Recommended Next Steps: {recommended_next_steps}",
            f"Disclaimer: {DISCLAIMER}",
        ]
    )

    return LegalSummaryResult(
        content=content,
        english_summary=english_summary,
        telugu_summary=telugu_summary,
        ownership_summary=ownership_summary,
        document_insights=document_insights,
        risk_flags=risk_flags,
        recommended_next_steps=recommended_next_steps,
        disclaimer=DISCLAIMER,
        model_name="mock-local",
        is_mock=True,
    )


def _generate_openai_placeholder_summary(
    document: PropertyDocument,
    property_record: Property,
) -> LegalSummaryResult:
    prompt = build_legal_summary_prompt(document, property_record)
    english_summary = (
        "OpenAI API key is configured, but live OpenAI execution is intentionally "
        "left as a placeholder for the local MVP. OCR text is included in the prompt."
    )
    document_insights = f"Prompt prepared for model {settings.openai_model}: {prompt}"

    return LegalSummaryResult(
        content="\n\n".join(
            [
                f"English Summary: {english_summary}",
                "Telugu Summary: OpenAI integration placeholder.",
                "Ownership Summary: Pending live model integration.",
                f"Document Insights: {document_insights}",
                "Risk Flags: Human review required.",
                "Recommended Next Steps: Connect official OpenAI client before production use.",
                f"Disclaimer: {DISCLAIMER}",
            ]
        ),
        english_summary=english_summary,
        telugu_summary="OpenAI integration placeholder.",
        ownership_summary="Pending live model integration.",
        document_insights=document_insights,
        risk_flags="Human review required.",
        recommended_next_steps="Connect official OpenAI client before production use.",
        disclaimer=DISCLAIMER,
        model_name=settings.openai_model,
        is_mock=False,
    )
