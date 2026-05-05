import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUser } from "@/lib/db/supabase-server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userData?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await supabase.from("users").select("id, email, display_name, role, created_at, subscriptions(plan, status)").order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(data ?? []);
}
