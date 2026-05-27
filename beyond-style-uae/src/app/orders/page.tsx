import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Orders"
      description="Order lifecycle from draft to delivered. Dispatch is blocked until payment is confirmed."
      table="orders"
      columns={[
        { key: "product_summary", label: "Product" },
        { key: "quantity", label: "Qty" },
        { key: "total_amount", label: "Total (AED)" },
        { key: "order_status", label: "Status" },
        { key: "payment_status", label: "Payment" },
        { key: "courier_status", label: "Courier" },
        { key: "delivery_city", label: "City" },
        { key: "created_at", label: "Created" },
      ]}
    />
  );
}
