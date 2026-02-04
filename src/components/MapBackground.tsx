import React from 'react';

const MapBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#e5e7eb] overflow-hidden pointer-events-none select-none">
      {/* Abstract Map Pattern */}
      <svg className="absolute w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Decorative Abstract Routes */}
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M 200 800 Q 400 400 800 100"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="4"
          strokeDasharray="10 5"
          className="opacity-40"
        />
        <path
          d="M 150 800 Q 300 500 600 50"
          fill="none"
          stroke="#64748b"
          strokeWidth="3"
          strokeDasharray="8 8"
          className="opacity-20"
        />

        {/* Map markers simulated */}
        <circle cx="200" cy="750" r="4" fill="#64748b" className="opacity-50" />
        <circle cx="350" cy="550" r="4" fill="#64748b" className="opacity-50" />
        <circle cx="800" cy="100" r="4" fill="#64748b" className="opacity-50" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 to-transparent"></div>
    </div>
  );
};

export default MapBackground;
