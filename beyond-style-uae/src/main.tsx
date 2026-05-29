import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { initAnalytics } from "@/lib/analytics";
import "@/index.css";

// Initialize GA4 + Meta Pixel once at boot.
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
