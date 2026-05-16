import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { getProject } from "@/lib/store/mock-store";
import { getTheme } from "@/lib/themes";
import { formatDate } from "@/lib/utils/dates";
import { dictionary } from "@/lib/i18n/dictionary";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const theme = getTheme(project.theme);
  const t = dictionary.en;

  return (
    <div>
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-rta-navy"
      >
        ← {t.common.backToProjects}
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <StatusDot status={project.status} />
            <h1 className="display-tight text-3xl font-bold text-rta-navy">
              {project.name}
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {t.subjects[project.subject]} · {theme.name_en} theme
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Source documents</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <p className="text-sm text-slate-600">{t.projects.noDocuments}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t.projects.uploadComing}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project info</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <InfoRow label="Authority" value={project.client_authority_en} />
            <InfoRow label="Counterparty" value={project.counterparty_en} />
            <InfoRow label="Start" value={formatDate(project.start_date)} />
            <InfoRow label="End" value={formatDate(project.end_date)} />
            <InfoRow label="Theme" value={theme.name_en} />
            <InfoRow label="Created" value={formatDate(project.created_at)} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
          </CardHeader>
          <CardBody>
            <ol className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
              <Step n={1} title="Upload documents" status="locked">
                Phase 2 unlocks PDF/DOCX/XLSX ingestion.
              </Step>
              <Step n={2} title="Extract facts" status="locked">
                Claude Sonnet structured extraction with citations.
              </Step>
              <Step n={3} title="Write a brief" status="locked">
                One paragraph for the composition engine.
              </Step>
              <Step n={4} title="Publish dashboard" status="locked">
                11-point quality gate blocks bad dashboards.
              </Step>
            </ol>

            <div className="mt-6 flex gap-3">
              <Button disabled>Upload documents</Button>
              <Link href="/projects">
                <Button variant="secondary">{t.common.backToProjects}</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-800">{value || "—"}</span>
    </div>
  );
}

function Step({
  n,
  title,
  status,
  children,
}: {
  n: number;
  title: string;
  status: "active" | "locked" | "done";
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rta-navy text-white">
          {n}
        </span>
        {status === "locked" && (
          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-600">
            Locked
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-rta-navy">{title}</p>
      <p className="mt-1 text-xs text-slate-600">{children}</p>
    </li>
  );
}
