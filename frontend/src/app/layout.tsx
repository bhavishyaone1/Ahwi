import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { AetherDataProvider } from "../context/AetherDataContext";
import { ForecastTraceDrawer } from "../components/ForecastTraceDrawer";
import { AtmosphericBackground } from "../components/common/Backgrounds";

export const metadata: Metadata = {
  title: "AETHER — Adaptive Hybrid Weather Intelligence",
  description: "Dynamic Multi-Model Meteorological Blending, Confidence & Extreme Weather Decision Support (MoES PS 26081)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col antialiased relative selection:bg-sky-100 selection:text-sky-900">
        <AtmosphericBackground />
        <AetherDataProvider>
          <Navbar />
          <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 mb-12 lg:mb-0">
            {children}
          </main>
          <ForecastTraceDrawer />
          <footer className="border-t border-slate-200 py-6 bg-slate-50 text-center text-xs text-slate-500 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                AETHER Meteorological Decision Support &copy; {new Date().getFullYear()} &bull; SIH Problem Statement 26081
              </p>
              <p className="font-mono text-[11px] text-slate-400">
                ECMWF IFS &bull; ECMWF AIFS &bull; NOAA GFS &bull; PyTorch LSTM &bull; XGBoost &bull; SHAP
              </p>
            </div>
          </footer>
        </AetherDataProvider>
      </body>
    </html>
  );
}
