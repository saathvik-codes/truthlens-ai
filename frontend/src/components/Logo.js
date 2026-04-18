import React from 'react';

const Logo = ({ size = 40, animated = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'logo-animated' : ''}
      data-testid="truthlens-logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A0A0A" />
          <stop offset="100%" stopColor="#002FA7" />
        </linearGradient>
      </defs>

      {/* Outer lens circle */}
      <circle
        cx="30"
        cy="30"
        r="26"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        className="logo-ring"
      />

      {/* Inner lens circle */}
      <circle
        cx="30"
        cy="30"
        r="18"
        stroke="#0A0A0A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* Connecting lines as paths */}
      <path d="M 30 14 L 30 50" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <path d="M 22 22 L 38 22" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <path d="M 22 22 L 30 30" stroke="#002FA7" strokeWidth="1" opacity="0.5" />
      <path d="M 38 22 L 30 30" stroke="#002FA7" strokeWidth="1" opacity="0.5" />
      <path d="M 30 30 L 30 42" stroke="#002FA7" strokeWidth="1" opacity="0.5" />

      {/* Neural network nodes */}
      <circle cx="30" cy="14" r="2.5" fill="#002FA7" className="logo-node logo-node-1" />
      <circle cx="22" cy="22" r="2" fill="#0A0A0A" className="logo-node logo-node-2" />
      <circle cx="38" cy="22" r="2" fill="#0A0A0A" className="logo-node logo-node-3" />
      <circle cx="30" cy="30" r="3" fill="#002FA7" className="logo-node logo-node-center" />
      <circle cx="30" cy="42" r="2" fill="#0A0A0A" className="logo-node logo-node-4" />
      <circle cx="30" cy="50" r="1.5" fill="#002FA7" className="logo-node logo-node-5" />

      {/* Scan line as path */}
      <path
        d="M 8 30 L 52 30"
        stroke="#002FA7"
        strokeWidth="0.5"
        opacity="0.6"
        className="logo-scan-line"
      />
    </svg>
  );
};

export default Logo;
