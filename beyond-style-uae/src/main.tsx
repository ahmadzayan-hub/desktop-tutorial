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

// Register the service worker so the store is installable and works offline.
// Production only — during dev the SW would cache the Vite HMR assets.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is a progressive enhancement — ignore failures */
    });
  });
}
