import type {
  AISummary,
  Agent,
  AgentCreatePayload,
  AuthToken,
  DocumentStatus,
  DocumentType,
  HealthResponse,
  ListingStatus,
  PropertyCreatePayload,
  PropertyDocument,
  PropertyPricingEstimate,
  PropertyRecord,
  VerificationStatus,
  User,
  UserRole,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://trueplot.onrender.com"
    : "http://localhost:8000");

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

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }
  const token = window.localStorage.getItem("trueplot_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  baseUrl: API_BASE_URL,

  health: () => request<HealthResponse>("/health"),

  signup: (payload: {
    email: string;
    full_name: string;
    password: string;
    phone?: string | null;
    role: UserRole;
  }) =>
    request<AuthToken>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () =>
    request<User>("/auth/me", {
      headers: authHeaders(),
    }),

  listProperties: () => request<PropertyRecord[]>("/properties"),

  createProperty: (payload: PropertyCreatePayload) =>
    request<PropertyRecord>("/properties", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  getProperty: (id: string) => request<PropertyRecord>(`/properties/${id}`),

  updatePropertyStatus: (id: string, listingStatus: ListingStatus) =>
    request<PropertyRecord>(`/properties/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ listing_status: listingStatus }),
    }),

  updatePropertyVerification: (
    id: string,
    isVerified: boolean,
    verificationStatus: VerificationStatus,
  ) =>
    request<PropertyRecord>(`/properties/${id}/verification`, {
      method: "PATCH",
      headers: authHeaders(),
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
      headers: authHeaders(),
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
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  generateSummary: (documentId: string) =>
    request<AISummary>(`/documents/${documentId}/ai-summary`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({}),
    }),

  listSummaries: (propertyId: string) =>
    request<AISummary[]>(`/properties/${propertyId}/ai-summaries`),

  generatePricingEstimate: (propertyId: string) =>
    request<PropertyPricingEstimate>(`/properties/${propertyId}/pricing-estimate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({}),
    }),

  listPricingEstimates: (propertyId: string) =>
    request<PropertyPricingEstimate[]>(`/properties/${propertyId}/pricing-estimates`),

  listAgents: (verifiedOnly = false) =>
    request<Agent[]>(`/agents${verifiedOnly ? "?verified_only=true" : ""}`),

  createAgent: (payload: AgentCreatePayload) =>
    request<Agent>("/agents", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  getAgent: (id: string) => request<Agent>(`/agents/${id}`),

  updateAgentVerification: (id: string, isVerified: boolean) =>
    request<Agent>(`/agents/${id}/verification`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_verified: isVerified }),
    }),

  assignAgentToProperty: (propertyId: string, agentId: string | null) =>
    request<PropertyRecord>(`/properties/${propertyId}/agent`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ agent_id: agentId }),
    }),
};
