"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { CommandPalette } from "./CommandPalette";
import { SystemHealthModal } from "../SystemHealthModal";
import { ForecastTraceDrawer } from "../ForecastTraceDrawer";
import { AtmosphericBackground } from "../common/Backgrounds";
import { fetchSystemStatus } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    fetchSystemStatus()
      .then((st) => {
        setIsDemoMode(st?.data_mode !== "REAL");
      })
      .catch(() => {
        setIsDemoMode(true);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex antialiased">
      {/* Background Isobars / Coordinate Grid */}
      <AtmosphericBackground />

      {/* Global Toast Notifications */}
      <Toaster position="top-right" theme="dark" richColors closeButton />

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Persistent Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setHealthModalOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workstation Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-18" : "lg:pl-64"
        }`}
      >
        {/* Operational DEMO vs REAL Mode Banner (Visually load-bearing for situation room) */}
        {isDemoMode && (
          <div className="sticky top-0 z-40 bg-warning/15 border-b border-warning/30 px-3 py-1 text-center font-mono text-[10px] text-warning font-bold flex items-center justify-center gap-2 backdrop-blur-md">
            <AlertTriangle className="h-3 w-3 text-warning shrink-0 animate-pulse" />
            <span className="uppercase tracking-wider">
              OPERATIONAL ADVISORY: DEMO / SYNTHETIC SCENARIO MODE ACTIVE &bull; SATELLITE & NWP REPLAY DATA
            </span>
          </div>
        )}

        {/* Compact Workstation Top Header */}
        <TopHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenHealthModal={() => setHealthModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Main Workspace Body with Smooth Page Transitions */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-6 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.16, ease: "easeOut" }
              }
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Workstation Footer */}
        <footer className="border-t border-border py-4 px-6 bg-surface/50 text-center text-xs text-text-muted hidden lg:block">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <p>
              AETHER Meteorological Decision Support &copy; {new Date().getFullYear()} &bull; SIH Problem Statement 26081
            </p>
            <p className="font-mono text-[11px] text-text-muted">
              ECMWF IFS &bull; ECMWF AIFS &bull; NOAA GFS &bull; PyTorch LSTM &bull; Causal XGBoost &bull; SHAP
            </p>
          </div>
        </footer>
      </div>

      {/* Global Drawers & Modals */}
      <SystemHealthModal isOpen={healthModalOpen} onClose={() => setHealthModalOpen(false)} />
      <ForecastTraceDrawer />
    </div>
  );
};
