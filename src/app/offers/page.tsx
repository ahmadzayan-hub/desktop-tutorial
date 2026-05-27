import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Offers"
      description="Active offers govern pricing. The agent must verify an active, unexpired offer before quoting."
      table="offers"
      order="end_at"
      columns={[
        { key: "name", label: "Offer" },
        { key: "price", label: "Price (AED)" },
        { key: "delivery_rule", label: "Delivery" },
        { key: "vat_rule", label: "VAT" },
        { key: "emirates_covered", label: "Emirates" },
        { key: "end_at", label: "Expires" },
        { key: "active", label: "Active" },
      ]}
    />
  );
}
