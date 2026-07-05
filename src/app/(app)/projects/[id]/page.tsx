import { notFound } from "next/navigation";
import { getProject } from "@/lib/store/projects";
import { ProjectDetailView } from "./project-detail-view";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <ProjectDetailView project={project} />;
}
