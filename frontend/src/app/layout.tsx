import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AetherDataProvider } from "../context/AetherDataContext";
import { AppShell } from "../components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AETHER — Meteorological Intelligence Workstation",
  description:
    "Dynamic Multi-Model Meteorological Blending, Confidence & Extreme Weather Decision Support (MoES PS 26081)",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.className}`}
      suppressHydrationWarning
    >
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
