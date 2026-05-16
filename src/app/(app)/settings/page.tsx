import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSession } from "@/lib/store/mock-store";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display-tight mb-6 text-3xl font-bold text-rta-navy">
        Settings
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Row label="Name" value={mockSession.user.full_name} />
              <Row label="Email" value={mockSession.user.email} />
              <Row label="Preferred locale" value="English" />
              <Row label="Default theme" value="RTA" />
            </dl>
            <p className="mt-6 text-xs text-slate-500">
              Editable profile fields arrive when Supabase Auth is wired up
              in Phase 2.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System status</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Row label="Phase" value="1 · Foundation" />
              <Row label="Supabase" value="Not connected" />
              <Row label="Anthropic" value="Not connected" />
              <Row label="Build" value="Next.js 15 · Tailwind 4" />
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}
