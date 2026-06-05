import { ImageResponse } from "next/og";

export const alt = "Klusblok — Dé marktplaats voor klussers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #1e4f70 0%, #0f2535 70%, #0a1c2b 100%)",
          padding: 80,
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              background: "#f7c021",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f2535",
              fontSize: 56,
              fontWeight: 900,
            }}
          >
            K
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: -1,
              color: "white",
            }}
          >
            Klusblok
          </div>
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "white",
              maxWidth: 900,
            }}
          >
            Dé marktplaats voor klussers
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "#f7c021",
              maxWidth: 900,
            }}
          >
            Plaats gratis je klus · Geen abonnement · KVK-geverifieerd
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
