"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  CloudSun,
  Activity,
  Cpu,
  Layers,
  Compass,
  ShieldAlert,
  HelpCircle,
  Award,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface NavGroup {
  group: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    group: "OBSERVE",
    items: [
      { name: "Overview", href: "/", icon: CloudSun },
      { name: "Forecast", href: "/forecast", icon: Activity },
    ],
  },
  {
    group: "UNDERSTAND",
    items: [
      { name: "Model Intelligence", href: "/models", icon: Cpu },
      { name: "Weight Map", href: "/weight-map", icon: Layers },
      { name: "Climate Context", href: "/climate", icon: Compass },
    ],
  },
  {
    group: "ACT",
    items: [
      { name: "Extreme Risk", href: "/risk", icon: ShieldAlert },
      { name: "Ask AETHER", href: "/ask", icon: HelpCircle },
    ],
  },
  {
    group: "VERIFY",
    items: [
      { name: "Benchmark", href: "/benchmark", icon: Award },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenSettings,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-surface border-r border-border transition-all duration-300 select-none ${
          collapsed ? "w-18" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Branding (OpenWeather reference style) */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <CloudSun className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-text-primary">
                    AETHER
                  </span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    PS 26081
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-medium truncate">
                  Adaptive Weather Intelligence
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Profile Pill (OpenWeather reference style: Avatar + Name + Logout) */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-secondary/70 border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                  E
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-text-primary truncate">IMD / MoES Ops</span>
                  <span className="text-[10px] text-text-muted truncate">Station Delhi NCR</span>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                title="System settings"
                className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface transition shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!collapsed && (
                <span className="px-2 text-[10px] font-bold text-text-muted uppercase tracking-wider block font-mono">
                  {grp.group}
                </span>
              )}
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.name : undefined}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "text-[#e87a53] dark:text-[#f89b78] font-bold"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded-xl bg-amber-500/20 dark:bg-[#38231c] border border-amber-500/40 dark:border-[#e87a53]/50 -z-10 shadow-md shadow-amber-500/20 dark:shadow-[#e87a53]/25"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? "text-[#e87a53] dark:text-[#f89b78]"
                            : "text-text-muted group-hover:text-text-primary"
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Action CTA: Ask a question (Warm Coral Oblong Button matching OpenWeather Reference) */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <Link
              href="/ask"
              onClick={onCloseMobile}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#e87a53] via-[#ea580c] to-[#f97316] hover:from-[#f97316] hover:to-[#e87a53] hover:scale-[1.02] active:scale-[0.98] text-slate-950 font-black text-xs shadow-lg shadow-amber-600/35 transition-all"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>Ask a question</span>
            </Link>
          </div>
        )}

        {/* Bottom Dark Mode Switch (OpenWeather Reference Style: Moon icon + Dark mode label + coral toggle) */}
        <div className="p-3 border-t border-border bg-surface-secondary/40 flex items-center justify-between">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-text-muted shrink-0" />
                <span className="text-xs font-semibold text-text-primary">
                  Dark mode
                </span>
              </div>

              {/* iOS / OpenWeather style Toggle Switch with Coral active state */}
              <button
                onClick={toggleTheme}
                title="Switch theme"
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  theme === "dark" ? "bg-[#e87a53]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transform ring-0 transition duration-200 ease-in-out ${
                    theme === "dark" ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </>
          ) : (
            <button
              onClick={toggleTheme}
              title="Toggle Light / Dark mode"
              className="w-full flex justify-center p-1 text-text-muted hover:text-text-primary transition"
            >
              <Moon className="h-4 w-4 text-text-muted" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
