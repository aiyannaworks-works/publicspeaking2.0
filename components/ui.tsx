import React from "react";

const purple = "#667eea";
const green = "#10b981";
const red = "#ef4444";

// ── Button ────────────────────────────────────────────────────────────────────
type Variant = "primary" | "secondary" | "success" | "danger";

export function Btn({
  children,
  variant = "primary",
  onClick,
  disabled,
  style,
}: {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const bg =
    variant === "primary"
      ? purple
      : variant === "success"
      ? green
      : variant === "danger"
      ? red
      : "#f0f0f0";
  const color = variant === "secondary" ? "#333" : "#fff";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 28px",
        border: "none",
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        margin: 4,
        background: bg,
        color,
        opacity: disabled ? 0.5 : 1,
        transition: "all .2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeColor = "success" | "warning" | "info";

export function Badge({
  children,
  color = "info",
}: {
  children: React.ReactNode;
  color?: BadgeColor;
}) {
  const map: Record<BadgeColor, { bg: string; fg: string }> = {
    success: { bg: "#d1fae5", fg: "#065f46" },
    warning: { bg: "#fef3c7", fg: "#92400e" },
    info: { bg: "#dbeafe", fg: "#1e40af" },
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: map[color].bg,
        color: map[color].fg,
      }}
    >
      {children}
    </span>
  );
}

// ── FeedbackRow ───────────────────────────────────────────────────────────────
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
        padding: "10px 0",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <span>{label}</span>
      <Badge color={color}>{value}</Badge>
    </div>
  );
}

// ── RecordButton ──────────────────────────────────────────────────────────────
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
        width: 96,
        height: 96,
        borderRadius: "50%",
        border: "none",
        background: recording ? "#dc2626" : red,
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: recording ? "pulse 1.5s infinite" : "none",
      }}
    >
      {recording ? "⏹ Stop" : "🎤 Start"}
    </button>
  );
}

// ── Timer display ─────────────────────────────────────────────────────────────
export function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return (
    <div
      style={{ fontSize: 22, fontWeight: 700, color: purple, marginTop: 16 }}
    >
      {m}:{s}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#667eea,#764ba2)",
        color: "#fff",
        padding: 20,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, margin: "6px 0" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, opacity: 0.85 }}>{sub}</div>}
    </div>
  );
}
