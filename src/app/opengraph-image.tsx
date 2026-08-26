import { ImageResponse } from "next/og";
import { OWNER_NAME } from "@/lib/seo";

export const alt = `${OWNER_NAME} — Full-Stack Developer`;
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
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#09090b",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 620,
            height: 620,
            right: -160,
            top: -250,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(124,58,237,0.7), rgba(9,9,11,0) 68%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              width: 54,
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background: "linear-gradient(135deg, #8b5cf6, #4f46e5)",
            }}
          >
            W
          </div>
          winphony
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          <div style={{ display: "flex", fontSize: 78, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.045em" }}>
            Building thoughtful experiences for the web.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#c4b5fd" }}>
            {OWNER_NAME} · Full-Stack Developer
          </div>
        </div>
      </div>
    ),
    size,
  );
}
