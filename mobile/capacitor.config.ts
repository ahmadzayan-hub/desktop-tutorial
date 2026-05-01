import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.promptorchestrator.android",
  appName: "Prompt Orchestrator",
  webDir: "../public",
  // Point the wrapped app at your live Vercel URL.
  // For dev, use http://10.0.2.2:3000 from the Android emulator.
  server: {
    url: "https://desktop-tutorial-kappa-five.vercel.app",
    cleartext: false,
    androidScheme: "https"
  },
  android: {
    backgroundColor: "#f8fafc"
  }
};

export default config;
