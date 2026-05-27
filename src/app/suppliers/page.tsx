import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Suppliers"
      description="Supplier screening. No blind bulk purchase — sample & real video first."
      table="suppliers"
      order="name"
      columns={[
        { key: "name", label: "Supplier" },
        { key: "country", label: "Country" },
        { key: "sample_status", label: "Sample" },
        { key: "real_video_received", label: "Video" },
        { key: "moq", label: "MOQ" },
        { key: "unit_cost", label: "Unit cost" },
        { key: "risk_score", label: "Risk" },
      ]}
    />
  );
}
