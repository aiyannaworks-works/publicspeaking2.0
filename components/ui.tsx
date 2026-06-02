import React from "react";

// ─────────────────────────────────────────────
// Design tokens (mirrors CSS custom properties)
// ─────────────────────────────────────────────
const T = {
  orange:       "#E8732A",
  orangeDark:   "#C45E1A",
  orangeLight:  "#FFF0E6",
  green:        "#5A9E3A",
  greenDark:    "#437A2A",
  greenLight:   "#EBF5E6",
  ink:          "#1A1A1A",
  ink2:         "#3D3D3D",
  ink3:         "#6B6B6B",
  ink4:         "#9E9E9E",
  border:       "#E8E8E8",
  borderStrong: "#D0D0D0",
  surface:      "#F7F7F5",
  white:        "#FFFFFF",
  error:        "#D93025",
  errorBg:      "#FEE8E6",
  info:         "#1A73E8",
  infoBg:       "#E8F0FE",
} as const;

// ─────────────────────────────────────────────
// Btn
// ─────────────────────────────────────────────
type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";

export function Btn({
  children,
  variant = "primary",
  onClick,
  disabled,
  style,
  fullWidth,
}: {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}) {
  const themes: Record<Variant, React.CSSProperties> = {
    primary: {
      background: T.orange,
      color: "#fff",
      boxShadow: disabled ? "none" : "0 2px 8px rgba(232,115,42,0.30)",
    },
    success: {
      background: T.green,
      color: "#fff",
      boxShadow: disabled ? "none" : "0 2px 8px rgba(90,158,58,0.30)",
    },
    danger: {
      background: T.error,
      color: "#fff",
    },
    secondary: {
      background: T.white,
      color: T.ink2,
      border: `1.5px solid ${T.border}`,
      boxShadow: "none",
    },
    ghost: {
      background: "transparent",
      color: T.orange,
      border: `1.5px solid ${T.orange}`,
      boxShadow: "none",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "0.01em",
        padding: "13px 28px",
        borderRadius: 9999,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        whiteSpace: "nowrap",
        width: fullWidth ? "100%" : undefined,
        ...themes[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.filter = "brightness(0.93)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.filter = "none";
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "brightness(0.88)";
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.filter = "brightness(0.93)";
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// Badge / Pill
// ─────────────────────────────────────────────
type BadgeColor = "success" | "warning" | "info" | "orange" | "neutral";

export function Badge({
  children,
  color = "info",
}: {
  children: React.ReactNode;
  color?: BadgeColor;
}) {
  const map: Record<BadgeColor, { bg: string; fg: string }> = {
    success: { bg: T.greenLight,  fg: T.greenDark },
    warning: { bg: "#FFF8E1",     fg: "#8B5E00" },
    info:    { bg: T.infoBg,      fg: T.info },
    orange:  { bg: T.orangeLight, fg: T.orangeDark },
    neutral: { bg: T.surface,     fg: T.ink3 },
  };
  const { bg, fg } = map[color];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        background: bg,
        color: fg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// FeedbackRow
// ─────────────────────────────────────────────
export function FeedbackRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: BadgeColor;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 0",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <span style={{ fontSize: 14, color: T.ink2, fontWeight: 500 }}>{label}</span>
      <Badge color={color}>{value}</Badge>
    </div>
  );
}

// ─────────────────────────────────────────────
// RecordButton
// ─────────────────────────────────────────────
export function RecordButton({
  recording,
  onClick,
}: {
  recording: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 112,
        height: 112,
        borderRadius: "50%",
        border: "none",
        background: recording
          ? `radial-gradient(circle at 35% 35%, #FF6B6B, ${T.error})`
          : `radial-gradient(circle at 35% 35%, ${T.orangeLight === "#FFF0E6" ? "#FFAB76" : T.orangeLight}, ${T.orange})`,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        boxShadow: recording
          ? "0 0 0 10px rgba(217,48,37,0.12), 0 8px 24px rgba(217,48,37,0.30)"
          : `0 0 0 10px rgba(232,115,42,0.12), 0 8px 24px rgba(232,115,42,0.30)`,
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        animation: recording ? "pulse 1.8s ease-in-out infinite" : "none",
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1 }}>{recording ? "⏹" : "🎤"}</span>
      <span style={{ fontSize: 11, fontWeight: 800 }}>{recording ? "Stop" : "Start"}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// TimerDisplay
// ─────────────────────────────────────────────
export function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return (
    <div
      style={{
        fontSize: 36,
        fontWeight: 800,
        color: T.orange,
        marginTop: 20,
        fontFamily: "'Bricolage Grotesque', sans-serif",
        letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {m}:{s}
    </div>
  );
}

// ─────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "orange" | "green";
}) {
  const accentColor = accent === "green" ? T.green : T.orange;
  return (
    <div
      style={{
        background: T.white,
        padding: "20px 16px",
        borderRadius: 16,
        textAlign: "center",
        border: `1.5px solid ${T.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.ink4,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: accentColor ?? T.ink,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: T.ink4, fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SectionHeader
// ─────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 22,
          fontWeight: 800,
          color: T.ink,
          letterSpacing: "-0.03em",
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: T.ink3, lineHeight: 1.55 }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// InfoCard  (replaces ad-hoc blue info panels)
// ─────────────────────────────────────────────
export function InfoCard({
  children,
  accent = "orange",
}: {
  children: React.ReactNode;
  accent?: "orange" | "green" | "info";
}) {
  const colors = {
    orange: { border: T.orange,   bg: T.orangeLight },
    green:  { border: T.green,    bg: T.greenLight },
    info:   { border: T.info,     bg: T.infoBg },
  };
  const { border, bg } = colors[accent];
  return (
    <div
      style={{
        background: bg,
        borderLeft: `4px solid ${border}`,
        borderRadius: "0 12px 12px 0",
        padding: "16px 20px",
      }}
    >
      {children}
    </div>
  );
}

export { T };
