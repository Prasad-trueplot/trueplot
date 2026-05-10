"use client";

import { FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { formatDate, titleCase } from "@/lib/format";
import type { DocumentType, PropertyDocument } from "@/lib/types";

import { ErrorBlock } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";
import { Button, Card, FieldShell, inputStyles } from "./ui";

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "ec", label: "EC" },
  { value: "1b", label: "1B" },
  { value: "adangal", label: "Adangal" },
  { value: "sale_deed", label: "Sale deed" },
  { value: "pattadar_passbook", label: "Pattadar passbook" },
  { value: "fmb_map", label: "FMB map" },
  { value: "other", label: "Other" },
];

export function DocumentPanel({
  propertyId,
  documents,
  onDocumentsChange,
  onGenerateSummary,
}: {
  propertyId: string;
  documents: PropertyDocument[];
  onDocumentsChange: (documents: PropertyDocument[]) => void;
  onGenerateSummary: (documentId: string) => Promise<void>;
}) {
  const [documentType, setDocumentType] = useState<DocumentType>("sale_deed");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a document file before uploading.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await api.uploadDocument(propertyId, {
        documentType,
        file,
        notes: notes || undefined,
      });
      onDocumentsChange([...documents, uploaded]);
      setFile(null);
      setNotes("");
      event.currentTarget.reset();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function generate(documentId: string) {
    setGeneratingId(documentId);
    setError(null);
    try {
      await onGenerateSummary(documentId);
    } catch (summaryError) {
      setError(
        summaryError instanceof Error
          ? summaryError.message
          : "AI summary generation failed",
      );
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Land record vault
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Document upload
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Store local MVP documents for EC, 1B, Adangal, sale deed, passbook,
            FMB map, or other AP land records. PDF and image uploads are OCR-processed
            before AI summary generation.
          </p>
        </div>
        <span className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
          OCR-ready
        </span>
      </div>

      <form onSubmit={handleUpload} className="mt-5 grid gap-3 md:grid-cols-4">
        <FieldShell label="Type">
          <select
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value as DocumentType)
            }
            className={inputStyles}
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FieldShell>
        <div className="md:col-span-2">
          <FieldShell label="File">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className={inputStyles}
          />
          </FieldShell>
        </div>
        <FieldShell label="Notes">
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={inputStyles}
            placeholder="Optional"
          />
        </FieldShell>
        <div className="md:col-span-4">
          <Button
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload document"}
          </Button>
        </div>
      </form>

      {error ? <div className="mt-4"><ErrorBlock message={error} /></div> : null}

      <div className="mt-6 space-y-3">
        {documents.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            No documents uploaded yet.
          </p>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">{document.original_filename ?? document.file_name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {titleCase(document.document_type)} ·{" "}
                    {document.file_size_bytes?.toLocaleString("en-IN") ?? "0"} bytes ·{" "}
                    {formatDate(document.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={document.status} />
                  <StatusBadge value={document.is_verified ? "verified" : "pending"} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => generate(document.id)}
                  disabled={generatingId === document.id}
                  variant="secondary"
                >
                  {generatingId === document.id ? "Generating..." : "Generate OCR-backed AI summary"}
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    OCR status
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge value={document.ocr_extraction_status} />
                    {document.ocr_extraction_method ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {document.ocr_extraction_method}
                      </span>
                    ) : null}
                  </div>
                  {document.ocr_extraction_error ? (
                    <p className="mt-3 text-sm leading-6 text-red-700">
                      {document.ocr_extraction_error}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Extracted text preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {document.extracted_text
                      ? `${document.extracted_text.slice(0, 360)}${document.extracted_text.length > 360 ? "..." : ""}`
                      : "No OCR text captured yet."}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
