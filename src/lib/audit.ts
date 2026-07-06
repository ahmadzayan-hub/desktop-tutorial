/**
 * Lightweight audit logger. Writes to the `audit_logs` Supabase table.
 * Falls back to console.warn if the table doesn't exist or the write fails —
 * audit logging must never break the request that triggered it.
 *
 * Schema expected:
 *   audit_logs (
 *     id          uuid primary key default gen_random_uuid(),
 *     actor_id    uuid,           -- user who performed the action
 *     action      text not null,  -- e.g. "admin.list_users", "admin.change_role"
 *     target_id   text,           -- entity acted upon (user id, pack id, etc.)
 *     meta        jsonb,          -- optional extra context
 *     ip          text,
 *     created_at  timestamptz default now()
 *   )
 */

import { createServerClient } from "@supabase/ssr";

export interface AuditEvent {
  actorId: string;
  action: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

export async function auditLog(event: AuditEvent): Promise<void> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !url) {
    console.warn("[audit]", event);
    return;
  }

  try {
    const svc = createServerClient(url, serviceKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });

    const { error } = await svc.from("audit_logs").insert({
      actor_id: event.actorId,
      action: event.action,
      target_id: event.targetId ?? null,
      meta: event.meta ?? null,
      ip: event.ip ?? null,
    });

    if (error) {
      // Table may not exist yet — fall back to server log
      console.warn("[audit] write failed:", event, error.message);
    }
  } catch (e) {
    console.warn("[audit] exception:", event, e);
  }
}
