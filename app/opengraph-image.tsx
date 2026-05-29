import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Lunsford Software Development';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 32,
          }}
        >
          LUNSFORD SOFTWARE
          <br />
          DEVELOPMENT
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#9ca3af',
            textAlign: 'center',
            letterSpacing: '0.01em',
            marginBottom: 60,
          }}
        >
          Custom websites. Built from scratch.
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#4b5563',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          lunsfordsoftware.com
        </div>
      </div>
    ),
    { ...size },
  );
}
