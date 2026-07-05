import { notFound } from "next/navigation";
import { getProject } from "@/lib/store/projects";
import { PublishedView } from "./published-view";

export const dynamic = "force-dynamic";

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <PublishedView project={project} />;
}
