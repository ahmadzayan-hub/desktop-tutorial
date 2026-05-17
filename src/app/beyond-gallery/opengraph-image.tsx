import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Beyond Gallery by Beyond Jewellery. Curated accessories, gifts and lifestyle from Dubai. Powered by GiftMajlis.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg,#FAF8F1 0%,#F6F1E1 60%,#EFE3C4 100%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: "#1F2933",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "#171C8F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#B68A35",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 0.5 }}>
              Beyond Gallery
            </div>
            <div
              style={{
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#6B7280",
              }}
            >
              by Beyond Jewellery
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Curated Accessories, Gifts and Lifestyle Products from Dubai.
          </div>
          <div style={{ fontSize: 24, color: "#1F6F5B" }}>
            تفاصيل صغيرة تصنع فرقاً جميلاً
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            color: "#1F2933",
          }}
        >
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div
              style={{
                padding: "10px 18px",
                background: "#1F6F5B",
                color: "white",
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              WhatsApp +971 55 155 6991
            </div>
            <div style={{ color: "#6B7280" }}>
              UAE delivery, AED pricing, retail and bulk
            </div>
          </div>
          <div
            style={{
              padding: "10px 18px",
              border: "1px solid #B68A35",
              color: "#B68A35",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Powered by GiftMajlis
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
