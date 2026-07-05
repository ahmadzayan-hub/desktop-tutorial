import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'reviewer' | 'viewer' | 'api_user';
export type PreferredLanguage = 'en' | 'ar';
export type ProjectStatus = 'active' | 'closed' | 'on_hold';
export type TrafficLight = 'green' | 'amber' | 'red';

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
