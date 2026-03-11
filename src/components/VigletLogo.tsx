import React from "react";

interface ProductConfig {
  color: string;
  acronym: string;
  section: string;
  border: string;
}

const productConfig: Record<string, ProductConfig> = {
  turing: { color: "#4169E1", acronym: "Tu", section: "ES", border: "#FFDEAD" },
  shio: { color: "#FF6347", acronym: "Sh", section: "CMS", border: "#FFDEAD" },
  dumont: { color: "#006400", acronym: "Du", section: "DEP", border: "#FFDEAD" },
  vecchio: { color: "#6c757d", acronym: "Ve", section: "Auth", border: "#FFDEAD" },
};

interface VigletLogoProps {
  product: string;
  size?: number;
}

export default function VigletLogo({ product, size = 80 }: VigletLogoProps): React.ReactElement {
  const config = productConfig[product] ?? productConfig.turing;
  const isBadge = size < 56;
  const fontSize = isBadge ? size * 0.45 : size * 0.38;
  const sectionSize = size * 0.16;
  const shadowSize = Math.max(1, size * 0.04);

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: config.color,
        borderRadius: size * 0.15,
        border: `${Math.max(2, size * 0.035)}px solid ${config.border}`,
        position: "relative",
        display: "flex",
        alignItems: isBadge ? "center" : "flex-end",
        justifyContent: isBadge ? "center" : "flex-start",
        padding: isBadge ? 0 : size * 0.1,
        boxShadow: `0 ${shadowSize}px ${shadowSize * 2.5}px rgba(0,0,0,0.22), 0 ${shadowSize * 0.5}px ${shadowSize * 1.5}px rgba(0,0,0,0.19)`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {!isBadge && (
        <span
          style={{
            position: "absolute",
            top: size * 0.08,
            right: size * 0.1,
            fontSize: sectionSize,
            fontWeight: 300,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.05em",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {config.section}
        </span>
      )}
      <span
        style={{
          fontSize,
          fontWeight: 900,
          color: "white",
          lineHeight: 1,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {config.acronym}
      </span>
    </div>
  );
}
