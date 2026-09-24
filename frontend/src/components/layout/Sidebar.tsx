"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
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
import { Logo } from "@/components/common/Logo";
import { WeatherGrid } from "@/components/common/Backgrounds";

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
  const shouldReduceMotion = useReducedMotion();
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
        className={`fixed top-0 bottom-0 left-0 h-dvh z-50 flex flex-col bg-surface border-r border-border transition-all duration-300 select-none ${
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
            <Logo size={36} />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-text-primary font-display">
                    AETHER
                  </span>
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                    PS 26081
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-[0.08em] font-bold text-text-muted truncate">
                  Meteorological Intel
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

        {/* User Profile Pill */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent to-accent-hover text-slate-950 flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                  IMD
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-text-primary truncate">MoES / IMD Ops</span>
                  <span className="text-[10px] font-mono text-text-muted truncate">STN_DELHI_NCR</span>
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

        {/* Navigation & Operational Status */}
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto px-2.5 py-2">
          {/* Nav Groups */}
          <div className="space-y-4">
            {NAV_GROUPS.map((grp) => (
              <div key={grp.group} className="space-y-1">
                {!collapsed && (
                  <span className="px-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] block font-mono">
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
                        className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? "text-accent font-bold"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary hover:-translate-y-0.5 hover:shadow-sm"
                        } ${collapsed ? "justify-center px-0" : ""}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-xl bg-accent/15 dark:bg-accent/20 border border-accent/40 -z-10 shadow-md shadow-accent/25"
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : { type: "spring", stiffness: 450, damping: 32 }
                            }
                          />
                        )}
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? "text-accent"
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

          {/* Centered System Status Card (Operation Situation Room) */}
          {!collapsed && (
            <div className="flex-1 flex flex-col justify-center my-3 relative">
              <div className="relative overflow-hidden rounded-xl bg-surface-2/80 border border-border p-3 space-y-2.5 shadow-xs">
                <WeatherGrid className="opacity-[0.04]" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] font-mono">
                    System Status
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-success font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    NOMINAL
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      <span>Pipeline</span>
                    </span>
                    <span className="font-semibold text-text-primary">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span>Active Models</span>
                    </span>
                    <span className="font-semibold text-text-primary">3 / 3</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-info" />
                      <span>Last Sync</span>
                    </span>
                    <span className="font-semibold text-text-primary">2m ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Highlight Action CTA: Ask AETHER Assistant */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <Link
              href="/ask"
              onClick={onCloseMobile}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-accent via-amber-500 to-amber-600 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] text-slate-950 font-black text-xs shadow-md shadow-accent/20 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Ask AETHER AI</span>
            </Link>
          </div>
        )}

        {/* Bottom Dark Mode Switch (OpenWeather Reference Style: Moon icon + Dark mode label + orange toggle) */}
        <div className="p-3 border-t border-border bg-surface-secondary/40 flex items-center justify-between">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-text-muted shrink-0" />
                <span className="text-xs font-semibold text-text-primary">
                  Dark mode
                </span>
              </div>

              {/* iOS / OpenWeather style Toggle Switch with orange active state */}
              <button
                onClick={toggleTheme}
                title="Switch theme"
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  theme === "dark" ? "bg-accent" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ease-in-out ${
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
