import { notFound } from "next/navigation";
import { getProject } from "@/lib/store/mock-store";
import { ProjectDetailView } from "./project-detail-view";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <ProjectDetailView project={project} />;
}
