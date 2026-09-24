import React from "react";

interface LogoProps {
  className?: string;
  size?: number; // size in px, defaults to 36
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 36 }) => {
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center text-slate-950 shadow-sm shadow-accent/25 shrink-0 overflow-hidden transition-transform group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      aria-label="AETHER Atmospheric Intelligence Logo"
    >
      <svg
        width={Math.round(size * 0.65)}
        height={Math.round(size * 0.65)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-slate-950"
      >
        {/* Outer concentric radar arc */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="40 16"
          opacity="0.5"
        />

        {/* Mid isobar / sensor sweep ring */}
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="26 8"
          opacity="0.8"
        />

        {/* Central Observation Node / Station Core */}
        <circle cx="12" cy="12" r="2.75" fill="currentColor" />

        {/* Synoptic Radial Sweep Ray */}
        <line
          x1="12"
          y1="12"
          x2="19.5"
          y2="4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
