import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — matches iOS rounded-rect masking style.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #FAF8F1 0%, #E5DAB2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: "50%",
            background: "#FAF8F1",
            border: "5px solid #B68A35",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 0 3px rgba(182,138,53,0.28)",
          }}
        >
          <div
            style={{
              fontSize: 74,
              fontWeight: 700,
              color: "#B68A35",
              lineHeight: 1,
              letterSpacing: -2,
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
