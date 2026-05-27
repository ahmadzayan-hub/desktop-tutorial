import RecordPage from "@/components/RecordPage";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <RecordPage
      title="Reviews"
      description="After-sale feedback & repeat-purchase loop. Share only with permission."
      table="reviews"
      columns={[
        { key: "rating", label: "Rating" },
        { key: "feedback", label: "Feedback" },
        { key: "permission_to_share", label: "Share OK" },
        { key: "story_mention", label: "Story mention" },
        { key: "created_at", label: "Date" },
      ]}
    />
  );
}
