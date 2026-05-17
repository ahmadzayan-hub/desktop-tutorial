import { SignUpForm } from "./sign-up-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignUpPage() {
  return <SignUpForm supabaseConfigured={isSupabaseConfigured()} />;
}
