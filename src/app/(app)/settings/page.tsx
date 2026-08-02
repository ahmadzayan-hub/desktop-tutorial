import type { Metadata } from "next";
import { SettingsView } from "./settings-view";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerUser } from "@/lib/supabase/server";
import { mockSession } from "@/lib/store/session";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your profile, workspace preferences, and system status.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabaseOn = isSupabaseConfigured();
  const user = supabaseOn ? await getServerUser() : null;

  return (
    <SettingsView
      user={
        user
          ? {
              full_name:
                (user.user_metadata?.full_name as string | undefined) ??
                user.email ??
                mockSession.user.full_name,
              email: user.email ?? mockSession.user.email,
              real: true,
            }
          : {
              full_name: mockSession.user.full_name,
              email: mockSession.user.email,
              real: false,
            }
      }
      supabaseConfigured={supabaseOn}
      anthropicConfigured={!!process.env.ANTHROPIC_API_KEY}
    />
  );
}
