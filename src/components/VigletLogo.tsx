import React from "react";

export const PRODUCT_COLORS: Record<string, string> = {
  dumont: "#006400",
  shio: "#FF6347",
  turing: "#4169E1",
};

const PRODUCT_META: Record<string, { acronym: string; section: string }> = {
  dumont: { acronym: "Du", section: "DEP" },
  shio: { acronym: "Sh", section: "CMS" },
  turing: { acronym: "Tu", section: "ES" },
};

const TEXT_COLOR = "#FFDEAD";

interface VigletLogoProps {
  product: string;
  size?: number;
  glow?: boolean;
  className?: string;
}

function GlowAcronym({ acronym, duration = 2 }: { acronym: string; duration?: number }) {
  return (
    <>
      {acronym.split("").map((char, i) => (
        <span
          key={i}
          className="vg-logo-glow"
          style={{ animationDelay: `${-((i + 1) * (duration / acronym.length)).toFixed(4)}s` }}
        >
          {char}
        </span>
      ))}
    </>
  );
}

export default function VigletLogo({ product, size = 48, glow = true, className }: VigletLogoProps): React.ReactElement | null {
  const meta = PRODUCT_META[product];
  const color = PRODUCT_COLORS[product] ?? "#555555";
  if (!meta) return null;

  const r = (ratio: number) => Math.round(size * ratio);
  const borderRadius = Math.max(6, r(0.107));
  const borderWidth = Math.max(1, r(0.029));
  const shadow = `0 ${r(0.014)}px ${r(0.029)}px rgba(0,0,0,0.22), 0 ${r(0.021)}px ${r(0.071)}px rgba(0,0,0,0.19)`;

  const isSmall = size < 56;

  if (isSmall) {
    const padLeft = Math.max(4, r(0.09));
    const smallOffsetY = r(0.25);
    return (
      <div
        className={className}
        aria-label={meta.acronym}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: size,
          height: size,
          flexShrink: 0,
          backgroundColor: color,
          color: TEXT_COLOR,
          paddingLeft: padLeft,
          borderRadius,
          borderWidth,
          borderStyle: "solid",
          borderColor: TEXT_COLOR,
          boxShadow: shadow,
          boxSizing: "border-box",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: Math.max(10, r(0.46)),
            fontWeight: 900,
            lineHeight: 1,
            marginTop: smallOffsetY,
            fontFamily: "var(--font-brand)",
          }}
        >
          {glow ? <GlowAcronym acronym={meta.acronym} /> : meta.acronym}
        </span>
      </div>
    );
  }

  const pad = r(0.089);
  return (
    <div
      className={className}
      aria-label={`${meta.acronym} ${meta.section}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: color,
        color: TEXT_COLOR,
        padding: `${pad}px`,
        borderRadius,
        borderWidth,
        borderStyle: "solid",
        borderColor: TEXT_COLOR,
        boxShadow: shadow,
        boxSizing: "border-box",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontSize: Math.max(6, r(0.125)),
          fontWeight: 300,
          textAlign: "right",
          lineHeight: 1,
          opacity: 0.85,
          letterSpacing: "0.04em",
          alignSelf: "flex-end",
          fontFamily: "var(--font-brand)",
        }}
      >
        {meta.section}
      </div>
      <div
        style={{
          fontSize: r(0.46),
          fontWeight: 900,
          lineHeight: 1,
          alignSelf: "flex-start",
          fontFamily: "var(--font-brand)",
        }}
      >
        {glow ? <GlowAcronym acronym={meta.acronym} /> : meta.acronym}
      </div>
    </div>
  );
}
