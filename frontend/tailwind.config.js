/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aether: {
          base: "#FFFFFF",
          surface: "#F8FAFC",
          subtle: "#F1F5F9",
          border: "#E2E8F0",
          navy: "#0F172A",
          slate: "#475569",
          muted: "#64748B",
          primary: "#0284C7",
          sky: "#38BDF8",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};
