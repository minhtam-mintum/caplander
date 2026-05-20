import { useEffect } from 'react';

export function LoadingPage() {
  useEffect(() => {
    return () => {
      document.getElementById('splash')?.remove();
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#f7f9fb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        fontFamily: '"Geist Variable", system-ui, sans-serif',
        zIndex: 9998,
      }}
    >
      <style>{`
        @keyframes _loading-bar {
          0%   { transform: translateX(-100%) scaleX(0.3); }
          50%  { transform: translateX(0%)    scaleX(0.6); }
          100% { transform: translateX(100%)  scaleX(0.3); }
        }
      `}</style>

      <img src='/logo.png' alt='Caplander' style={{ width: 80, height: 80 }} />

      <span style={{ color: '#1f108e', fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.015em' }}>
        Caplander
      </span>

      <div style={{ width: 192, height: 2, backgroundColor: '#e6e8ea', borderRadius: 9999, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#1f108e',
            borderRadius: 9999,
            transformOrigin: 'left center',
            animation: '_loading-bar 1.4s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
