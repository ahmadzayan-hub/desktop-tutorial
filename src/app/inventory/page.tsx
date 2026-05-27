import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Inventory"
      description="Stock by colour & finish. Never confirm stock unless explicitly available."
      table="inventory"
      order="last_updated"
      columns={[
        { key: "colour", label: "Colour" },
        { key: "finish", label: "Finish" },
        { key: "quantity_available", label: "Available" },
        { key: "quantity_reserved", label: "Reserved" },
        { key: "quantity_paid", label: "Paid" },
        { key: "quantity_dispatched", label: "Dispatched" },
        { key: "quantity_delivered", label: "Delivered" },
        { key: "last_updated", label: "Updated" },
      ]}
    />
  );
}
