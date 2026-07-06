import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Renders the Beyond Gallery monogram as a 512x512 PNG at the edge.
// Used for the PWA manifest icon, browser tab icon, and Android home-screen.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #FAF8F1 0%, #EFE7CB 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "#FAF8F1",
            border: "12px solid #B68A35",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 0 8px rgba(182,138,53,0.25)",
          }}
        >
          <div
            style={{
              fontSize: 210,
              fontWeight: 700,
              color: "#B68A35",
              lineHeight: 1,
              letterSpacing: -6,
              fontFamily: "serif",
              display: "flex",
            }}
          >
            BG
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
