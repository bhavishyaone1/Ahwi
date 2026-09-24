import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-accent to-accent-hover hover:brightness-105 text-slate-950 font-bold shadow-md shadow-accent/25",
        coral:
          "bg-gradient-to-r from-accent to-accent-hover hover:brightness-105 text-slate-950 font-black shadow-md shadow-accent/25",
        destructive:
          "bg-gradient-to-r from-danger to-danger/90 hover:brightness-105 text-white shadow-md shadow-danger/25",
        outline:
          "border border-border/90 bg-surface text-text-secondary shadow-sm hover:bg-surface-2 hover:text-text-primary",
        secondary:
          "bg-surface-2 text-text-primary shadow-sm hover:bg-surface-2/80",
        ghost: "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
        link: "text-accent underline-offset-4 hover:underline",
        scientific:
          "border border-info/30 bg-info/10 text-info hover:bg-info/20 shadow-sm shadow-info/20 font-bold",
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
