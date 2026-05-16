import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="display-tight text-3xl font-bold text-rta-navy">
          New project
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          A project groups source documents, extracted facts, briefs, and
          dashboard snapshots.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardBody>
          <NewProjectForm />
        </CardBody>
      </Card>
    </div>
  );
}
