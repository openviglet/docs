import React from "react";

interface ColorConfig {
  bg: string;
  text: string;
  border: string;
}

const colors: Record<string, ColorConfig> = {
  turing: { bg: "#EFF6FF", text: "#4169E1", border: "#BFDBFE" },
  shio: { bg: "#FFF7ED", text: "#C73E00", border: "#FED7AA" },
  dumont: { bg: "#F0FFF0", text: "#006400", border: "#BBF7D0" },
  vecchio: { bg: "#F8FAFC", text: "#6c757d", border: "#E2E8F0" },
};

interface ProductBadgeProps {
  product: string;
  label: string;
}

export default function ProductBadge({ product, label }: ProductBadgeProps): React.ReactElement {
  const c = colors[product] ?? colors.turing;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: c.text,
        }}
      />
      {label}
    </span>
  );
}
