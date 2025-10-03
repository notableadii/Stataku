import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              margin: "0 0 20px 0",
              textShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            Stataku
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "rgba(255,255,255,0.9)",
              margin: "0",
              maxWidth: "800px",
              lineHeight: "1.4",
            }}
          >
            Connect, share, and discover on our social platform
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
