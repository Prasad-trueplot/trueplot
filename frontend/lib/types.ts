export type ListingStatus = "draft" | "active" | "paused" | "closed";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type ListingType = "sale" | "lease" | "sale_or_lease";
export type PropertyType = "land" | "apartment" | "house" | "commercial";
export type DocumentType =
  | "ec"
  | "1b"
  | "adangal"
  | "sale_deed"
  | "pattadar_passbook"
  | "fmb_map"
  | "other";
export type DocumentStatus = "pending" | "under_review" | "approved" | "rejected";

export type PropertyRecord = {
  id: string;
  owner_id: string;
  assigned_agent_id: string | null;
  title: string;
  description: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  address_line: string | null;
  village: string | null;
  mandal: string | null;
  district: string | null;
  state: string;
  survey_number: string | null;
  latitude: number | null;
  longitude: number | null;
  extent_sq_yards: string | null;
  is_verified: boolean;
  verification_status: VerificationStatus;
  listing_status: ListingStatus;
  created_at: string;
  updated_at: string;
};

export type PropertyCreatePayload = {
  owner_id: string;
  title: string;
  description?: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  address_line?: string | null;
  village?: string | null;
  mandal?: string | null;
  district?: string | null;
  state: string;
  survey_number?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  extent_sq_yards?: number | null;
  listing_status: ListingStatus;
  verification_status: VerificationStatus;
  is_verified: boolean;
};

export type PropertyDocument = {
  id: string;
  property_id: string;
  uploaded_by_user_id: string | null;
  document_type: DocumentType;
  file_name: string;
  original_filename: string | null;
  stored_filename: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  file_url: string | null;
  status: DocumentStatus;
  is_verified: boolean;
  notes: string | null;
  admin_review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AISummary = {
  id: string;
  property_id: string;
  document_id: string | null;
  created_by_user_id: string | null;
  summary_type: "property" | "document" | "lead";
  content: string;
  english_summary: string | null;
  telugu_summary: string | null;
  ownership_summary: string | null;
  document_insights: string | null;
  risk_flags: string | null;
  recommended_next_steps: string | null;
  disclaimer: string | null;
  model_name: string | null;
  is_mock: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type HealthResponse = {
  status: string;
  service: string;
};

export type UserRole = "admin" | "seller" | "buyer" | "verified_agent";

export type User = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthToken = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type Agent = {
  id: string;
  user_id: string;
  license_number: string | null;
  agency_name: string | null;
  service_area: string | null;
  district_specialization: string | null;
  mandal_specialization: string | null;
  village_specialization: string | null;
  supports_leasing: boolean;
  supports_nri: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type AgentCreatePayload = {
  user_id: string;
  license_number?: string | null;
  agency_name?: string | null;
  service_area?: string | null;
  district_specialization?: string | null;
  mandal_specialization?: string | null;
  village_specialization?: string | null;
  supports_leasing: boolean;
  supports_nri: boolean;
  is_verified: boolean;
};
