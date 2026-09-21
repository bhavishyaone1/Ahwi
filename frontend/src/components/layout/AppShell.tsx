"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { SystemHealthModal } from "../SystemHealthModal";
import { ForecastTraceDrawer } from "../ForecastTraceDrawer";
import { AtmosphericBackground } from "../common/Backgrounds";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary flex antialiased">
      {/* Background Isobars / Coordinate Grid */}
      <AtmosphericBackground />

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
        {/* Compact Workstation Top Header */}
        <TopHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenHealthModal={() => setHealthModalOpen(true)}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-6 min-w-0">
          {children}
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
