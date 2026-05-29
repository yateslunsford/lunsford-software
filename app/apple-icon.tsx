import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/* ═══════════════════════════════════════════════════════════
   apple-icon — 180×180 PNG generated at the edge.
   The [ L ] bracket mark rendered as CSS boxes (Satori-safe,
   no SVG path parsing needed).
═══════════════════════════════════════════════════════════ */
export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0a0a0a',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* [ L ] mark — CSS border approach, guaranteed Satori-compatible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Left bracket [ */}
          <div
            style={{
              width: 16,
              height: 62,
              borderLeft: '5px solid white',
              borderTop: '5px solid white',
              borderBottom: '5px solid white',
            }}
          />

          {/* The L — vertical bar + horizontal foot */}
          <div style={{ position: 'relative', width: 28, height: 62 }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 6,
                height: 62,
                background: 'white',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 28,
                height: 6,
                background: 'white',
              }}
            />
          </div>

          {/* Right bracket ] */}
          <div
            style={{
              width: 16,
              height: 62,
              borderRight: '5px solid white',
              borderTop: '5px solid white',
              borderBottom: '5px solid white',
            }}
          />

        </div>
      </div>
    ),
    { ...size },
  );
}
