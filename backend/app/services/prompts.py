AI_LEGAL_SUMMARY_PROMPT_TEMPLATE = """
You are assisting TRUEPLOT with a local MVP land-document review workflow.

Document context:
- Document type: {document_type}
- Original filename: {filename}
- Property title: {property_title}
- District: {district}
- Mandal: {mandal}
- Village: {village}
- Survey number: {survey_number}

Create an AI-assisted summary for human legal review only.
Do not present the output as final legal advice.

Return these sections:
1. English summary
2. Telugu summary
3. Ownership summary
4. Document insights
5. Risk flags
6. Recommended next steps
7. Disclaimer
"""

