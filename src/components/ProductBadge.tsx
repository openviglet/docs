import React from "react";
import { Badge } from "@site/src/components/ui/badge";

type ProductVariant = "turing" | "shio" | "dumont";

interface ProductBadgeProps {
  product: string;
  label: string;
}

export default function ProductBadge({ product, label }: ProductBadgeProps): React.ReactElement {
  const variant = (["turing", "shio", "dumont"].includes(product) ? product : "default") as ProductVariant;
  return (
    <Badge variant={variant}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: "currentColor" }}
      />
      {label}
    </Badge>
  );
}
