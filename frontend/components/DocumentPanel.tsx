"use client";

import { FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { formatDate, titleCase } from "@/lib/format";
import type { DocumentType, PropertyDocument } from "@/lib/types";

import { ErrorBlock } from "./StateBlock";
import { StatusBadge } from "./StatusBadge";

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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Document upload</h2>
        <p className="text-sm text-slate-600">
          Store local MVP documents for EC, 1B, Adangal, sale deed, passbook,
          FMB map, or other AP land records.
        </p>
      </div>

      <form onSubmit={handleUpload} className="mt-5 grid gap-3 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Type</span>
          <select
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value as DocumentType)
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">File</span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Notes</span>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Optional"
          />
        </label>
        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={isUploading}
            className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload document"}
          </button>
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
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
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
                <button
                  onClick={() => generate(document.id)}
                  disabled={generatingId === document.id}
                  className="rounded-md border border-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-60"
                >
                  {generatingId === document.id ? "Generating..." : "Generate AI summary"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

