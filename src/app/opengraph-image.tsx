import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mutabasir · The Director's Lens";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0F1170 0%, #171C8F 60%, #2A2FBA 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "60px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "white",
              color: "#171C8F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
              Mutabasir
            </span>
            <span style={{ marginTop: 4, fontSize: 18, opacity: 0.7 }}>
              The Director&apos;s Lens
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            maxWidth: 880,
          }}
        >
          From paperwork to board insight in 90 seconds.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: 60,
          }}
        >
          <span
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: "#EE0032",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Powered by Basira
          </span>
          <span style={{ opacity: 0.7, fontSize: 18 }}>mutabasir.ae</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
