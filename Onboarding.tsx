"use client";

import { useState } from "react";
import { Session, UserData } from "@/lib/types";
import Onboarding from "./Onboarding";
import Dashboard from "./Dashboard";
import RhythmLab from "./RhythmLab";
import DailyGames from "./DailyGames";
import Progress from "./Progress";

type Tab = "home" | "rhythm" | "games" | "progress";

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [streak, setStreak] = useState(0);

  const addSession = (sess: Omit<Session, "id">) => {
    const newSession: Session = { id: Date.now(), ...sess };
    setSessions((prev) => {
      const last = prev[prev.length - 1];
      if (
        !last ||
        new Date(last.date).toDateString() !== new Date().toDateString()
      ) {
        setStreak((n) => n + 1);
      }
      return [...prev, newSession];
    });
  };

  const NAV: { id: Tab; label: string }[] = [
    { id: "home", label: "Dashboard" },
    { id: "rhythm", label: "Rhythm Lab" },
    { id: "games", label: "Daily Games" },
    { id: "progress", label: "Progress" },
  ];

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.logo}>🎯 Confidence & Competence</span>
        {user && (
          <nav style={styles.nav}>
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                style={styles.tab(tab === id)}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main style={styles.card}>
        {!user ? (
          <Onboarding
            onComplete={(u) => {
              setUser(u);
              setTab("home");
            }}
          />
        ) : tab === "home" ? (
          <Dashboard sessions={sessions} streak={streak} />
        ) : tab === "rhythm" ? (
          <RhythmLab addSession={addSession} />
        ) : tab === "games" ? (
          <DailyGames addSession={addSession} />
        ) : (
          <Progress sessions={sessions} />
        )}
      </main>
    </div>
  );
}

const purple = "#667eea";

const styles = {
  wrap: {
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "inherit",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 10,
    marginBottom: 18,
    background: "#fff",
    borderRadius: 14,
    padding: "14px 24px",
    boxShadow: "0 4px 12px rgba(0,0,0,.12)",
  } as React.CSSProperties,
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: purple,
  } as React.CSSProperties,
  nav: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    background: active ? purple : "#f0f0f0",
    color: active ? "#fff" : "#333",
    transition: "all .2s",
  }),
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    boxShadow: "0 4px 12px rgba(0,0,0,.12)",
    minHeight: 500,
  } as React.CSSProperties,
};
