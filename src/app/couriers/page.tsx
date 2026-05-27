import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Courier Tracking"
      description="Courier costs are configurable, not hard-coded. Outside Dubai must be confirmed before any promise."
      table="couriers"
      order="name"
      columns={[
        { key: "name", label: "Courier" },
        { key: "service_type", label: "Service" },
        { key: "default_cost", label: "Default cost (AED)" },
        { key: "vat_included", label: "VAT incl." },
        { key: "notes", label: "Notes" },
      ]}
    />
  );
}
