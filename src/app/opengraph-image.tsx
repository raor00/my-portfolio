import { ImageResponse } from "next/og";

export const alt = "Rafael Oviedo — Full Stack Developer · roviedo.dev";
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
          padding: "72px",
          backgroundColor: "#f5f5f7",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#0a0a0f" }}>
            roviedo.dev
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#b45309",
              border: "1px solid rgba(217,119,6,0.35)",
              background: "rgba(217,119,6,0.1)",
              padding: "8px 16px",
              borderRadius: 10,
            }}
          >
            Dev3pack 2026 · #1 VE · #28 Global
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#0a0a0f", lineHeight: 1.05 }}>
            Rafael Oviedo
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#b45309", fontWeight: 600 }}>
            Páginas web · SaaS · código a medida
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(10,10,15,0.55)", maxWidth: 860 }}>
            Full Stack Developer · AI Agent Engineer. Sistemas que llegan a producción.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "rgba(10,10,15,0.45)" }}>
          devraor00@gmail.com
        </div>
      </div>
    ),
    size,
  );
}
