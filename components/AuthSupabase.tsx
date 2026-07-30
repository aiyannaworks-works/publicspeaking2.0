"use client";

import { useState } from "react";
import { signUpUser, signInUser } from "@/lib/auth-context";
import { Btn, T } from "./ui";

type AuthMode = "login" | "signup";

export default function AuthSupabase({
  onAuthSuccess,
  t = (key: string) => key,
}: {
  onAuthSuccess: (userId: string, profile: any) => void;
  t?: (key: string) => string;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let result;
      if (mode === "signup") {
        result = await signUpUser(email, password, username, fullName);
      } else {
        result = await signInUser(email, password);
      }
      if (result.error) {
        setError(getErrorMessage(result.error));
      } else if (
        "requiresEmailConfirmation" in result &&
        result.requiresEmailConfirmation
      ) {
        setSuccess(
          "Account created! Check your email and confirm your address, then return here to sign in."
        );
      } else if (result.user && result.profile) {
        onAuthSuccess(result.user.id, result.profile);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={s.page}>
      {/* Brand panel */}
      <div className="auth-brand" style={s.brand}>
        <div className="auth-brand-inner" style={s.brandInner}>
          <div style={s.logoMark}>
            <span style={{ fontSize: 28 }}>🎙</span>
          </div>
          <h1 className="articulate-wordmark" style={s.wordmark}>Articulate</h1>
          <p style={s.tagline}>
            Master public speaking through daily practice, real-time feedback,
            and friendly competition.
          </p>

          {/* Feature pills */}
          <div className="auth-features" style={s.featureList}>
            {[
              { icon: "🔥", text: "Daily streaks & XP" },
              { icon: "🎯", text: "Personalised drills" },
              { icon: "📈", text: "Track your progress" },
              { icon: "🏆", text: "Compete with friends" },
            ].map(({ icon, text }) => (
              <div key={text} style={s.featureItem}>
                <span style={s.featureIcon}>{icon}</span>
                <span style={s.featureText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel" style={s.formPanel}>
        <div className="auth-form-card" style={s.formCard}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={s.formSubtitle}>
              {mode === "login"
                ? "Sign in to continue your journey"
                : "Start speaking with confidence today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            {mode === "signup" && (
              <>
                <Field label="Full name">
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={s.input}
                    required
                  />
                </Field>
                <Field label="Username">
                  <input
                    type="text"
                    placeholder="janesmith"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={s.input}
                    required
                  />
                </Field>
              </>
            )}

            <Field label="Email address">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={s.input}
                required
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={s.input}
                required
              />
            </Field>

            {error && (
              <div style={s.errorBox}>
                <span style={{ fontSize: 15 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={s.successBox} role="status">
                <span style={{ fontSize: 15 }}>✓</span>
                <span>{success}</span>
              </div>
            )}

            <Btn fullWidth disabled={loading} style={{ marginTop: 4 }}>
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </Btn>
          </form>

          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerText}>or</span>
            <span style={s.dividerLine} />
          </div>

          <p className="auth-toggle-row" style={s.toggleRow}>
            {mode === "login" ? "Don't have an account?" : "Already have one?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              style={s.toggleBtn}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: T.ink2,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  /* ── Brand panel (left / top on mobile) ── */
  brand: {
    flex: "0 0 42%",
    background: `linear-gradient(145deg, ${T.ink} 0%, #2E1A0E 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  brandInner: {
    maxWidth: 340,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: T.orange,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 4px 16px rgba(232,115,42,0.40)",
  },
  wordmark: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 36,
    fontWeight: 800,
    color: "#FFFFFF",
    letterSpacing: "-0.04em",
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.65,
    marginBottom: 36,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  } as React.CSSProperties,
  featureText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.80)",
    fontWeight: 500,
  },
  /* ── Form panel (right) ── */
  formPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    background: T.surface,
  },
  formCard: {
    background: T.white,
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: `1.5px solid ${T.border}`,
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: T.ink,
    letterSpacing: "-0.03em",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: T.ink3,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  input: {
    padding: "13px 16px",
    border: `1.5px solid ${T.border}`,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 500,
    color: T.ink,
    background: T.white,
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    width: "100%",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#FEE8E6",
    color: T.error,
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    border: `1px solid rgba(217,48,37,0.15)`,
  },
  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: T.greenLight,
    color: T.greenDark,
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.5,
    border: `1px solid rgba(90,158,58,0.18)`,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: T.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: 600,
    color: T.ink4,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  toggleRow: {
    textAlign: "center",
    fontSize: 14,
    color: T.ink3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: T.orange,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textDecoration: "underline",
    textUnderlineOffset: 2,
  },
};
