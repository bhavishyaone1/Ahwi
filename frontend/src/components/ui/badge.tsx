import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-accent text-slate-950 font-bold shadow-sm",
        secondary:
          "border border-border bg-surface-2 text-text-primary",
        destructive:
          "border border-danger/30 bg-danger/10 text-danger shadow-sm shadow-danger/10",
        outline:
          "border border-border text-text-primary bg-surface",
        success:
          "border border-success/30 bg-success/10 text-success shadow-sm shadow-success/10",
        warning:
          "border border-warning/30 bg-warning/10 text-warning shadow-sm shadow-warning/10",
        scientific:
          "border border-info/30 bg-info/10 text-info font-bold shadow-sm shadow-info/10",
        demo:
          "border border-warning/30 bg-warning/10 text-warning font-bold shadow-sm shadow-warning/10",
        real:
          "border border-success/30 bg-success/10 text-success font-bold shadow-sm shadow-success/10",
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
