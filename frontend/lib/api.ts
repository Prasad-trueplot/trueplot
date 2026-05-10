import type {
  AISummary,
  Agent,
  AgentCreatePayload,
  DocumentStatus,
  DocumentType,
  HealthResponse,
  ListingStatus,
  PropertyCreatePayload,
  PropertyDocument,
  PropertyRecord,
  VerificationStatus,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type RequestOptions = RequestInit & {
  formData?: FormData;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (options.formData) {
    body = options.formData;
  } else if (body && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  baseUrl: API_BASE_URL,

  health: () => request<HealthResponse>("/health"),

  listProperties: () => request<PropertyRecord[]>("/properties"),

  createProperty: (payload: PropertyCreatePayload) =>
    request<PropertyRecord>("/properties", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProperty: (id: string) => request<PropertyRecord>(`/properties/${id}`),

  updatePropertyStatus: (id: string, listingStatus: ListingStatus) =>
    request<PropertyRecord>(`/properties/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ listing_status: listingStatus }),
    }),

  updatePropertyVerification: (
    id: string,
    isVerified: boolean,
    verificationStatus: VerificationStatus,
  ) =>
    request<PropertyRecord>(`/properties/${id}/verification`, {
      method: "PATCH",
      body: JSON.stringify({
        is_verified: isVerified,
        verification_status: verificationStatus,
      }),
    }),

  uploadDocument: (
    propertyId: string,
    params: {
      documentType: DocumentType;
      file: File;
      notes?: string;
    },
  ) => {
    const formData = new FormData();
    formData.append("document_type", params.documentType);
    formData.append("file", params.file);
    if (params.notes) {
      formData.append("notes", params.notes);
    }

    return request<PropertyDocument>(`/properties/${propertyId}/documents`, {
      method: "POST",
      formData,
    });
  },

  listDocuments: (propertyId: string) =>
    request<PropertyDocument[]>(`/properties/${propertyId}/documents`),

  updateDocumentReview: (
    documentId: string,
    payload: {
      status: DocumentStatus;
      is_verified: boolean;
      admin_review_notes?: string;
    },
  ) =>
    request<PropertyDocument>(`/documents/${documentId}/review`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  generateSummary: (documentId: string) =>
    request<AISummary>(`/documents/${documentId}/ai-summary`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  listSummaries: (propertyId: string) =>
    request<AISummary[]>(`/properties/${propertyId}/ai-summaries`),

  listAgents: (verifiedOnly = false) =>
    request<Agent[]>(`/agents${verifiedOnly ? "?verified_only=true" : ""}`),

  createAgent: (payload: AgentCreatePayload) =>
    request<Agent>("/agents", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAgent: (id: string) => request<Agent>(`/agents/${id}`),

  updateAgentVerification: (id: string, isVerified: boolean) =>
    request<Agent>(`/agents/${id}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ is_verified: isVerified }),
    }),

  assignAgentToProperty: (propertyId: string, agentId: string | null) =>
    request<PropertyRecord>(`/properties/${propertyId}/agent`, {
      method: "PATCH",
      body: JSON.stringify({ agent_id: agentId }),
    }),
};
