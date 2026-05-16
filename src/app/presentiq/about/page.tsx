import type { Metadata } from "next";
import { About } from "./About";

export const metadata: Metadata = {
  title: "About",
  description: "Why Pitchora exists, who built it, and what the name means. The idea-to-deck studio for boardroom-ready presentations.",
};

export default function AboutPage() {
  return <About />;
}
