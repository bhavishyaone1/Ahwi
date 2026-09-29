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
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Zap,
  Radio,
  Server,
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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 h-dvh z-50 flex flex-col transition-all duration-300 select-none
          bg-surface/98 dark:bg-[#0b0d12]/98
          border-r border-border
          backdrop-blur-2xl
          shadow-[var(--shadow-panel)]
          ${collapsed ? "w-[4.5rem]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Branding ───────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-border overflow-hidden">
          {/* Subtle accent stripe at the top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden group min-w-0"
          >
            <div className="shrink-0">
              <Logo size={34} />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[15px] font-black tracking-tight text-text-primary font-display leading-none">
                  AETHER
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.1em] font-bold text-text-muted leading-tight mt-0.5">
                  Met·Intel Platform
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex shrink-0 items-center justify-center h-6 w-6 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* ── Operator badge ─────────────────────────────────────────── */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-2/70 border border-border/80 hover:border-border transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-sm shrink-0">
                  IMD
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-text-primary truncate leading-none">
                    MoES / IMD Ops
                  </span>
                  <span className="text-[9px] font-mono text-text-muted truncate leading-tight mt-0.5">
                    STN_DELHI_NCR
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                title="Settings"
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface transition shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation + System Status ─────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto px-2.5 py-3">
          {/* Nav groups */}
          <div className="space-y-5">
            {NAV_GROUPS.map((grp) => (
              <div key={grp.group} className="space-y-0.5">
                {!collapsed && (
                  <span className="px-2.5 mb-1.5 text-[9.5px] font-bold text-text-muted/70 uppercase tracking-[0.14em] block font-mono">
                    {grp.group}
                  </span>
                )}
                {grp.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.name : undefined}
                      className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[11.5px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "text-accent font-bold"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-2/80"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded-xl bg-accent/12 dark:bg-accent/18 border border-accent/35"
                          style={{
                            boxShadow: "0 2px 12px -2px rgba(249,115,22,0.2)",
                          }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 450, damping: 32 }
                          }
                        />
                      )}
                      <Icon
                        className={`h-[15px] w-[15px] shrink-0 ${
                          isActive ? "text-accent" : "text-text-muted"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate relative z-10">{item.name}</span>
                      )}
                      {isActive && !collapsed && (
                        <span className="ml-auto relative z-10 h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* System Status panel */}
          {!collapsed && (
            <div className="relative mt-4 rounded-xl border border-border/80 bg-surface-2/50 overflow-hidden">
              <WeatherGrid className="opacity-[0.03] text-sky-500" />
              {/* Accent corner shimmer */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black text-text-muted/80 uppercase tracking-[0.12em] font-mono">
                    System Status
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-success font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    NOMINAL
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[10.5px]">
                  {[
                    { dot: "bg-success", label: "Pipeline", value: "Active" },
                    { dot: "bg-accent", label: "Models", value: "3 / 3" },
                    { dot: "bg-info", label: "Last Sync", value: "2m ago" },
                  ].map(({ dot, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                        {label}
                      </span>
                      <span className="font-semibold text-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Ask AETHER CTA ─────────────────────────────────────────── */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <Link
              href="/ask"
              onClick={onCloseMobile}
              className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                bg-gradient-to-r from-accent via-amber-500 to-amber-600
                hover:brightness-110 active:scale-[0.98]
                text-slate-950 font-black text-[11px]
                shadow-[0_4px_18px_-4px_rgba(249,115,22,0.45)]
                transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono uppercase tracking-wider text-[10px]">
                Ask AETHER AI
              </span>
            </Link>
          </div>
        )}

        {/* ── Dark mode toggle ───────────────────────────────────────── */}
        <div className="px-3 pb-4 border-t border-border pt-3 bg-surface-2/30 flex items-center justify-between">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <span className="text-[11px] font-semibold text-text-primary">Dark mode</span>
              </div>
              <button
                onClick={toggleTheme}
                title="Switch theme"
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  theme === "dark" ? "bg-accent" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ${
                    theme === "dark" ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </>
          ) : (
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="w-full flex justify-center p-1.5 text-text-muted hover:text-text-primary transition rounded-lg hover:bg-surface-2"
            >
              <Moon className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
