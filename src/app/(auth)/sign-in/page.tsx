import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

async function signInAction() {
  "use server";
  // Phase 1 mock: no real auth. Replaced by Supabase Auth in Phase 2.
  redirect("/projects");
}

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Sign in to continue with your projects.
        </p>
      </CardHeader>
      <CardBody>
        <form action={signInAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@authority.gov.ae"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Phase 1 scaffold · authentication is not yet wired to Supabase.
            Submitting enters the demo session.
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-rta-navy hover:underline">
            Sign up
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
