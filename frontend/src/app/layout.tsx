import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AetherDataProvider } from "../context/AetherDataContext";
import { AppShell } from "../components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AETHER — Adaptive Hybrid Weather Intelligence",
  description:
    "Dynamic Multi-Model Meteorological Blending, Confidence & Extreme Weather Decision Support (MoES PS 26081)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AetherDataProvider>
            <AppShell>{children}</AppShell>
          </AetherDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
