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
        {/* Top Branding */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 dark:from-sky-500 dark:to-sky-300 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-500/20 shrink-0 group-hover:scale-105 transition-transform">
              Æ
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-text-primary">
                    AETHER
                  </span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    PS 26081
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-medium truncate">
                  Weather Intelligence
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

        {/* Operator Badge */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-secondary/80 border border-border">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs font-bold font-mono">
                  OP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">IMD / MoES Ops</span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Station Active
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                title="System Diagnostics"
                className="text-text-muted hover:text-text-primary p-1 rounded transition"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!collapsed && (
                <span className="px-2 text-[10px] font-bold text-text-muted uppercase tracking-wider block">
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
                      className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "text-sky-900 dark:text-sky-100 font-bold"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded-lg bg-sky-100 dark:bg-sky-950/80 border border-sky-300/80 dark:border-sky-800 -z-10 shadow-xs"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? "text-sky-600 dark:text-sky-400"
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

        {/* Highlight Action CTA: Ask AETHER (coral/accent like OpenWeather reference) */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <Link
              href="/ask"
              onClick={onCloseMobile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask AETHER Assistant</span>
            </Link>
          </div>
        )}

        {/* Bottom Theme & Settings Bar */}
        <div className="p-3 border-t border-border bg-surface-secondary/40 flex items-center justify-between">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-sky-400 shrink-0" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-medium text-text-primary">
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </span>
              </div>

              {/* iOS / OpenWeather style Toggle Switch */}
              <button
                onClick={toggleTheme}
                title="Switch theme"
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  theme === "dark" ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-700"
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
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-sky-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
