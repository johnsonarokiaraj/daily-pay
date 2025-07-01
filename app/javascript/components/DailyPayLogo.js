import React from 'react';

const DailyPayLogo = ({ size = 40, showText = true, variant = 'default' }) => {
  const colors = {
    default: {
      primary: '#1677ff',
      secondary: '#69c0ff',
      accent: '#52c41a',
      text: '#001529'
    },
    light: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      accent: '#52c41a',
      text: '#ffffff'
    },
    dark: {
      primary: '#1677ff',
      secondary: '#69c0ff',
      accent: '#52c41a',
      text: '#001529'
    }
  };

  const theme = colors[variant];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showText ? 12 : 0 }}>
      {/* Logo Image */}
      <img
        src="/storage/dailypaylogo.jpg"
        alt="Daily Pay Logo"
        width={size}
        height={size}
        style={{
          flexShrink: 0,
          objectFit: 'contain',
          borderRadius: '8px' // Rounded corners for better appearance
        }}
        onError={(e) => {
          // Fallback to a simple text logo if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />

      {/* Fallback Text Logo (hidden by default) */}
      <div
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          color: theme.text,
          fontWeight: 'bold',
          fontSize: Math.max(12, size * 0.3),
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        DP
      </div>

      {/* Text Label */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: theme.text,
              fontSize: Math.max(14, size * 0.35),
              fontWeight: 'bold',
              lineHeight: 1.2,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Daily Pay
          </span>
          <span
            style={{
              color: variant === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              fontSize: Math.max(10, size * 0.2),
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Finance Tracker
          </span>
        </div>
      )}
    </div>
  );
};

export default DailyPayLogo;
