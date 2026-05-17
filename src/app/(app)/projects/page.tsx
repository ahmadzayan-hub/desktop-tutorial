import { ProjectsView } from "./projects-view";
import { listProjects } from "@/lib/store/mock-store";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <ProjectsView projects={projects} />;
}
