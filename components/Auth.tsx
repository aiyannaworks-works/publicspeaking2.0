"use client";

import { useState } from "react";
import { signUp, signIn } from "@/lib/supabase-auth";
import { Btn } from "./ui";

type AuthMode = "login" | "signup";

export default function Auth({ onAuthSuccess }: { onAuthSuccess: (userId: string) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (mode === "signup") {
        result = await signUp(email, password, username, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : String(result.error));
      } else if (result.user) {
        onAuthSuccess(result.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 className="articulate-wordmark" style={styles.title}>Articulate</h1>
        <p style={styles.subtitle}>Master the Art of Speaking</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "signup" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <div style={styles.error}>{error}</div>}

          <Btn style={{ width: "100%" }} disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </Btn>
        </form>

        <div style={styles.toggle}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            style={styles.toggleBtn}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#fafaf8",
    padding: "20px",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 40,
    border: "2px solid #e0e0e0",
    maxWidth: 400,
    width: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  } as React.CSSProperties,
  title: {
    fontSize: 32,
    fontWeight: 900,
    color: "#2a2a2a",
    fontFamily: "'Syne', sans-serif",
    marginBottom: 4,
    textAlign: "center" as const,
  } as React.CSSProperties,
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" as const,
    marginBottom: 32,
  } as React.CSSProperties,
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    marginBottom: 24,
  } as React.CSSProperties,
  input: {
    padding: 14,
    border: "2px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.2s",
  } as React.CSSProperties,
  error: {
    background: "#ffe0e0",
    color: "#d32f2f",
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
  } as React.CSSProperties,
  toggle: {
    textAlign: "center" as const,
    fontSize: 14,
    color: "#666",
  } as React.CSSProperties,
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#d97e3a",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "underline",
  } as React.CSSProperties,
};
