import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Payments"
      description="Payment tracking & reconciliation. No dispatch until the owner confirms payment."
      table="payments"
      columns={[
        { key: "payment_method", label: "Method" },
        { key: "amount_expected", label: "Expected" },
        { key: "amount_received", label: "Received" },
        { key: "vat_amount", label: "VAT" },
        { key: "status", label: "Status" },
        { key: "order_activated", label: "Activated" },
        { key: "created_at", label: "Time" },
      ]}
    />
  );
}
