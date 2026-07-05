import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'reviewer' | 'viewer' | 'api_user';
export type PreferredLanguage = 'en' | 'ar';
export type ProjectStatus = 'active' | 'closed' | 'on_hold';
export type TrafficLight = 'green' | 'amber' | 'red';

export type SubmissionType =
  | 'invoice'
  | 'timesheet'
  | 'technical_doc'
  | 'progress_update'
  | 'other';

export type ProcessingStatus = 'pending' | 'processing' | 'complete' | 'error';
export type ApprovalStatus = 'pending' | 'approved' | 'conditional' | 'rejected';

export type FindingType =
  | 'compliance_pass'
  | 'compliance_fail'
  | 'alert'
  | 'insight'
  | 'recommendation';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EvidenceLevel =
  | 'verified_source'
  | 'saved_rule'
  | 'working_assumption'
  | 'pending_confirmation'
  | 'unknown';

export interface VertexUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  preferred_language: PreferredLanguage;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  contract_ref: string;
  contract_value_aed: number | null;
  commencement_date: string | null;
  completion_date: string | null;
  performance_bond_aed: number | null;
  insurance_amount_aed: number | null;
  insurance_expiry_date: string | null;
  kpi_cap_percent: number;
  owner_id: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  project_id: string;
  submission_type: SubmissionType;
  document_name: string;
  file_url: string;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
  processing_status: ProcessingStatus;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  compliance_score: number | null;
  traffic_light: TrafficLight | null;
  confidence_percent: number | null;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiFinding {
  id: string;
  submission_id: string;
  finding_type: FindingType;
  severity: Severity;
  title: string;
  description: string | null;
  contract_clause_ref: string | null;
  evidence_extract: string | null;
  evidence_level: EvidenceLevel;
  source_citation: string | null;
  confidence_percent: number;
  requires_action: boolean;
  ai_model_used: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  submission_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface DashboardStats {
  submissions_pending_count: number;
  obligations_at_risk_count: number;
  insurance_expiring_30d_count: number;
  kpi_penalties_this_month_aed: number;
  compliance_score_avg_last_30d: number;
}

export type ActivityEventType =
  | 'submission_uploaded'
  | 'finding_created'
  | 'comment_added';

export interface ActivityEvent {
  event_id: string;
  event_type: ActivityEventType;
  occurred_at: string;
  actor_id: string | null;
  project_id: string;
  submission_id: string;
  title: string;
  detail: string | null;
}

export interface AiAnalysisResult {
  compliance_score: number;
  traffic_light: TrafficLight;
  confidence_percent: number;
  findings: Array<Omit<AiFinding, 'id' | 'submission_id' | 'created_at' | 'updated_at'>>;
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: VertexUser | null;
  session: Session | null;
  loading: boolean;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}
