import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Seat Scope 3D - preview the view from any movie theater seat";

const seatRows = [14, 16, 18];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          background: "#0d0a10",
          color: "#f4efe4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 620,
            height: 18,
            borderRadius: 4,
            background: "#f4efe4",
            boxShadow: "0 30px 90px rgba(244,239,228,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: 6,
              display: "flex",
            }}
          >
            SEAT SCOPE 3D
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#a89aae",
              display: "flex",
            }}
          >
            Check the view from any seat before the lights go down
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {seatRows.map((count, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", gap: 12 }}>
              {Array.from({ length: count }).map((_, seatIndex) => (
                <div
                  key={seatIndex}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background:
                      rowIndex === 1 && seatIndex === 8
                        ? "#f59e0b"
                        : "#251c2e",
                    border:
                      rowIndex === 1 && seatIndex === 8
                        ? "2px solid #f59e0b"
                        : "2px solid #473a52",
                    boxShadow:
                      rowIndex === 1 && seatIndex === 8
                        ? "0 0 34px rgba(245,158,11,0.8)"
                        : "none",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
