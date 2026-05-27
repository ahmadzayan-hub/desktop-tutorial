import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Audit Log"
      description="Every approval and record change is logged for accountability."
      table="audit_logs"
      columns={[
        { key: "action", label: "Action" },
        { key: "entity", label: "Entity" },
        { key: "entity_id", label: "Entity ID" },
        { key: "created_at", label: "Time" },
      ]}
    />
  );
}
