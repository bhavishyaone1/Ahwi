import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 36 }) => {
  const inner = Math.round(size * 0.62);
  return (
    <div
      className={`relative rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-transform group-hover:scale-105 ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
        boxShadow: "0 2px 12px -2px rgba(249,115,22,0.5), 0 0 0 1px rgba(249,115,22,0.3)",
      }}
      aria-label="AETHER Meteorological Intelligence"
    >
      {/* Subtle inner texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)",
        }}
      />

      <svg
        width={inner}
        height={inner}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Outer radar arc */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="rgba(15,23,42,0.55)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="38 14"
        />
        {/* Mid isobar ring */}
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke="rgba(15,23,42,0.75)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="22 8"
        />
        {/* Central node */}
        <circle cx="12" cy="12" r="2.5" fill="rgba(15,23,42,0.9)" />
        {/* Sweep ray */}
        <line
          x1="12"
          y1="12"
          x2="18.8"
          y2="5.2"
          stroke="rgba(15,23,42,0.85)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
