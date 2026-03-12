import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@site/src/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border border-brand-border bg-brand-bg text-brand px-3 py-1 text-xs",
        secondary:
          "border border-border bg-secondary text-secondary-foreground px-3 py-1 text-xs",
        outline:
          "border border-border bg-white text-foreground px-3 py-1 text-xs dark:bg-slate-800",
        turing:
          "border border-blue-200 bg-blue-50 text-product-turing px-3 py-1 text-xs dark:bg-blue-950/30 dark:border-blue-800",
        shio:
          "border border-orange-200 bg-orange-50 text-product-shio-text px-3 py-1 text-xs dark:bg-orange-950/30 dark:border-orange-800",
        dumont:
          "border border-green-200 bg-green-50 text-product-dumont px-3 py-1 text-xs dark:bg-green-950/30 dark:border-green-800",
        version:
          "border border-brand-border bg-brand-bg text-brand px-2.5 py-0.5 text-xs font-bold tracking-tight dark:bg-orange-950/20 dark:border-orange-800/40 dark:text-orange-400",
        latest:
          "bg-green-50 text-green-600 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide dark:bg-green-950/30 dark:text-green-400",
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
