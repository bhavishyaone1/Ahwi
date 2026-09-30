"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloudSun,
  Activity,
  Cpu,
  Layers,
  Compass,
  ShieldAlert,
  Sparkles,
  Award,
} from "lucide-react";

export const PRIMARY_NAV_TABS = [
  { name: "Overview", href: "/", icon: CloudSun },
  { name: "Forecast", href: "/forecast", icon: Activity },
  { name: "Models", href: "/models", icon: Cpu },
  { name: "Weight Map", href: "/weight-map", icon: Layers },
  { name: "Climate", href: "/climate", icon: Compass },
  { name: "Extreme Risk", href: "/risk", icon: ShieldAlert },
  { name: "Ask AI", href: "/ask", icon: Sparkles },
  { name: "Benchmark", href: "/benchmark", icon: Award },
];

export const TopTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation tabs"
      className="sticky top-14 z-20 w-full bg-surface/95 dark:bg-[#0b0d12]/95 backdrop-blur-xl border-b border-border/80 px-3 sm:px-5 py-1.5 overflow-x-auto no-scrollbar shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-max max-w-[1600px] mx-auto">
        {PRIMARY_NAV_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none ${
                isActive
                  ? "text-accent bg-accent/12 dark:bg-accent/18 shadow-xs border border-accent/30 font-bold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-2/80 border border-transparent"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              />
              <span className="tracking-tight whitespace-nowrap">{tab.name}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
