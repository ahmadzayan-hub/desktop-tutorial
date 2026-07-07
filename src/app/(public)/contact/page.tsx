import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — Get in Touch",
  description: "Have a question or need help? Contact the Tweenz AI team. We typically reply within one business day.",
  openGraph: {
    title: "Contact Tweenz AI",
    description: "Get in touch with the Tweenz AI team for support, feedback, or partnership inquiries.",
    url: "/contact",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
