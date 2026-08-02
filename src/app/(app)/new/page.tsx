import type { Metadata } from "next";
import { NewProjectView } from "./new-project-view";

export const metadata: Metadata = {
  title: "New project",
  description:
    "Create a project workspace to group documents, extracted facts, briefs and dashboard snapshots.",
};

export default function NewProjectPage() {
  return <NewProjectView />;
}
