"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { TopTabBar } from "./TopTabBar";
import { CommandPalette } from "./CommandPalette";
import { SystemHealthModal } from "../SystemHealthModal";
import { ForecastTraceDrawer } from "../ForecastTraceDrawer";
import { AtmosphericBackground } from "../common/Backgrounds";
import { fetchSystemStatus } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    fetchSystemStatus()
      .then((st) => { setIsDemoMode(st?.data_mode !== "REAL"); })
      .catch(() => { setIsDemoMode(true); });
  }, []);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex antialiased">
      <AtmosphericBackground />

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontSize: "12px",
          },
        }}
      />

      {/* Global Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

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
          sidebarCollapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"
        }`}
      >
        {/* Demo mode banner — slim, tasteful */}
        {isDemoMode && (
          <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-warning/8 dark:bg-warning/10 border-b border-warning/20 px-4 py-1 font-mono text-[9.5px] text-warning font-bold tracking-wider uppercase backdrop-blur-md">
            <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
            <span>Demo Mode · Synthetic NWP Replay · Not Operational IMD Data</span>
          </div>
        )}

        {/* Top Header */}
        <TopHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenHealthModal={() => setHealthModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Global Responsive Navigation Tab Bar */}
        <TopTabBar />

        {/* Page Body */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-6 min-w-0">
          <div key={pathname} className="min-w-0 transition-opacity duration-150">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="hidden lg:block border-t border-border/60 py-3 px-6 bg-surface/30 dark:bg-[#080a0e]/50">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[10px] text-text-muted">
            <span className="font-medium">
              AETHER Meteorological Decision Support &copy; {new Date().getFullYear()}
            </span>
            <span className="font-mono">
              ECMWF IFS · ECMWF AIFS · NOAA GFS · PyTorch LSTM · Causal XGBoost · SHAP
            </span>
          </div>
        </footer>
      </div>

      {/* Modals & Drawers */}
      <SystemHealthModal isOpen={healthModalOpen} onClose={() => setHealthModalOpen(false)} />
      <ForecastTraceDrawer />
    </div>
  );
};
