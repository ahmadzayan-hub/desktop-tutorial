import { ProjectsView } from "./projects-view";
import { listProjects } from "@/lib/store/mock-store";

export default function ProjectsPage() {
  const projects = listProjects();
  return <ProjectsView projects={projects} />;
}
