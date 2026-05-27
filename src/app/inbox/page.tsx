import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Customer Inbox"
      description="All captured conversations with their stage, temperature, and risk."
      table="conversations"
      columns={[
        { key: "platform", label: "Platform" },
        { key: "message_text", label: "Message" },
        { key: "stage", label: "Stage" },
        { key: "lead_temperature", label: "Temp" },
        { key: "persona", label: "Persona" },
        { key: "risk_level", label: "Risk" },
        { key: "created_at", label: "Time" },
      ]}
    />
  );
}
