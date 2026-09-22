import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm",
        secondary:
          "border border-border bg-surface-secondary text-text-primary",
        destructive:
          "border border-rose-300 dark:border-rose-800 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-xs shadow-rose-500/10",
        outline:
          "border border-border text-text-primary bg-surface",
        success:
          "border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs shadow-emerald-500/10",
        warning:
          "border border-amber-300 dark:border-amber-800 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-xs shadow-amber-500/10",
        scientific:
          "border border-sky-300 dark:border-sky-700 bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-bold shadow-xs shadow-sky-500/10",
        demo:
          "border border-amber-300 dark:border-amber-800 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold shadow-xs shadow-amber-500/10",
        real:
          "border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs shadow-emerald-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
