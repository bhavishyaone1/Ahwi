import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-100/80 border border-slate-200/40",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
