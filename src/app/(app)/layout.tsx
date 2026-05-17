import { AppShell } from "./_shell/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerUser } from "@/lib/supabase/server";
import { mockSession } from "@/lib/store/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string = mockSession.user.email;
  let usingRealAuth = false;
  if (isSupabaseConfigured()) {
    const user = await getServerUser();
    if (user) {
      userEmail = user.email ?? mockSession.user.email;
      usingRealAuth = true;
    }
  }
  return (
    <AppShell userEmail={userEmail} usingRealAuth={usingRealAuth}>
      {children}
    </AppShell>
  );
}
