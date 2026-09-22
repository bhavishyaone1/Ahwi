import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white shadow-md shadow-sky-500/30 active:bg-sky-700",
        coral:
          "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/25",
        destructive:
          "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-md shadow-rose-500/30",
        outline:
          "border border-border/90 bg-surface text-text-secondary shadow-sm hover:bg-surface-secondary hover:text-text-primary",
        secondary:
          "bg-surface-secondary text-text-primary shadow-sm hover:bg-surface-secondary/80",
        ghost: "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
        link: "text-sky-600 dark:text-sky-400 underline-offset-4 hover:underline",
        scientific:
          "border border-sky-300 dark:border-sky-700 bg-gradient-to-r from-sky-50/80 to-sky-100/60 dark:from-sky-950/60 dark:to-sky-900/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 shadow-sm shadow-sky-500/20 font-bold",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 rounded-lg px-2.5 text-[11px]",
        lg: "h-10 rounded-xl px-5 text-sm",
        icon: "h-8 w-8 rounded-lg",
        xs: "h-6 px-2 text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
