import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm supabaseConfigured={isSupabaseConfigured()} />
    </Suspense>
  );
}
