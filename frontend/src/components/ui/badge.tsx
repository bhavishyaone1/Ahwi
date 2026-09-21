import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-slate-900 text-white shadow-xs",
        secondary:
          "border border-slate-200 bg-slate-100 text-slate-900",
        destructive:
          "border border-rose-200 bg-rose-50 text-rose-700",
        outline: "border border-slate-200 text-slate-800 bg-white",
        success:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border border-amber-200 bg-amber-50 text-amber-700",
        scientific:
          "border border-sky-200 bg-sky-50 text-sky-800 font-semibold",
        demo:
          "border border-amber-300 bg-amber-50 text-amber-800 font-semibold",
        real:
          "border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold",
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
