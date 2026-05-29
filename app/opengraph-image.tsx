import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CSN Arbitrage — should you take the CSN loan?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f8f8f6',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 90px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: '#006AA7',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          CSN ARBITRAGE
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.1,
            marginBottom: 28,
          }}
        >
          Should you take
          <br />
          the CSN loan?
        </div>

        <div
          style={{
            fontSize: 22,
            color: '#6b7280',
            maxWidth: 780,
            lineHeight: 1.5,
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 52,
          }}
        >
          Model whether investing your loan in Swedish government bonds lets you
          repay immediately and keep the grant as profit.
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: '2Y yield', value: 'Live' },
            { label: 'Real ISINs', value: 'Riksgälden' },
            { label: 'Tax', value: 'ISK / Depot' },
          ].map((chip) => (
            <div
              key={chip.label}
              style={{
                background: '#006AA7',
                color: 'white',
                padding: '10px 22px',
                borderRadius: 10,
                fontSize: 15,
                fontFamily: 'system-ui, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ fontWeight: 700 }}>{chip.value}</span>
              <span style={{ opacity: 0.75, fontSize: 12 }}>{chip.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 90,
            fontSize: 13,
            color: '#9ca3af',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          csn-arbitrage.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
