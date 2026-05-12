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
  const colors = {
    primary: { bg: "#1cb0f6", border: "#1899d6", text: "#fff" },
    success: { bg: "#58cc02", border: "#46a302", text: "#fff" },
    danger: { bg: "#ff4b4b", border: "#d33131", text: "#fff" },
    secondary: { bg: "#fff", border: "#e5e5e5", text: "#afafaf" },
  };
  const theme = colors[variant];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 28px",
        border: "none",
        borderRadius: 16,
        fontSize: 15,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        margin: 4,
        background: theme.bg,
        color: theme.text,
        borderBottom: `4px solid ${theme.border}`,
        opacity: disabled ? 0.5 : 1,
        transition: "all .1s",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(2px)";
          e.currentTarget.style.borderBottomWidth = "2px";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderBottomWidth = "4px";
        }
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
        width: 120,
        height: 120,
        borderRadius: "50%",
        border: "none",
        background: recording ? "#ff4b4b" : "#1cb0f6",
        color: "#fff",
        fontSize: 16,
        fontWeight: 800,
        cursor: "pointer",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: recording ? "0 0 0 8px rgba(255, 75, 75, 0.2)" : "0 0 0 8px rgba(28, 176, 246, 0.2)",
        transition: "all 0.2s",
        borderBottom: `6px solid ${recording ? "#d33131" : "#1899d6"}`,
        textTransform: "uppercase",
      }}
    >
      <span style={{ fontSize: 32, marginBottom: 4 }}>{recording ? "⏹" : "🎤"}</span>
      {recording ? "Stop" : "Start"}
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
        background: "#fff",
        color: "#4b4b4b",
        padding: 20,
        borderRadius: 16,
        textAlign: "center",
        border: "2px solid #e5e5e5",
        borderBottom: "4px solid #e5e5e5",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#afafaf", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, margin: "8px 0", color: "#4b4b4b" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 13, fontWeight: 700, color: "#afafaf" }}>{sub}</div>}
    </div>
  );
}
