import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Customers"
      description="Sales-relevant customer records. No sensitive personal profiling."
      table="customers"
      columns={[
        { key: "name_display", label: "Name" },
        { key: "name_arabic_verified", label: "Arabic name" },
        { key: "platform", label: "Platform" },
        { key: "language", label: "Lang" },
        { key: "segment", label: "Segment" },
        { key: "consent_status", label: "Consent" },
        { key: "created_at", label: "Added" },
      ]}
    />
  );
}
