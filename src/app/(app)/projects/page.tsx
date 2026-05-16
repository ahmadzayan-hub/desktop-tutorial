import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { listProjects } from "@/lib/store/mock-store";
import { formatDate } from "@/lib/utils/dates";
import { dictionary } from "@/lib/i18n/dictionary";

export default function ProjectsPage() {
  const projects = listProjects();
  const t = dictionary.en;

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="display-tight text-3xl font-bold text-rta-navy">
            {t.projects.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All projects you own. Click any project to view its detail page.
          </p>
        </div>
        <Link href="/new">
          <Button>{t.projects.newProject}</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <p className="text-base text-slate-700">{t.projects.empty}</p>
            <div className="mt-6">
              <Link href="/new">
                <Button>{t.projects.newProject}</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardBody className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <StatusDot status={project.status} />
                      <h2 className="display-tight text-lg font-semibold text-rta-navy">
                        {project.name}
                      </h2>
                    </div>
                    <div className="mt-2 flex gap-6 text-xs text-slate-500">
                      <span>
                        {t.projects.subject}:{" "}
                        <span className="text-slate-700">
                          {t.subjects[project.subject]}
                        </span>
                      </span>
                      <span>
                        {t.projects.created}:{" "}
                        <span className="text-slate-700">
                          {formatDate(project.created_at)}
                        </span>
                      </span>
                      {project.client_authority_en && (
                        <span>
                          Authority:{" "}
                          <span className="text-slate-700">
                            {project.client_authority_en}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">→</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
