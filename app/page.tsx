"use client";

import { useState } from "react";
import { Session, UserData } from "@/lib/types";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import RhythmLab from "@/components/RhythmLab";
import DailyGames from "@/components/DailyGames";
import Progress from "@/components/Progress";

type Tab = "home" | "rhythm" | "games" | "progress";

const purple = "#667eea";

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [sessions, setSessions] = useState<Session[]>([]);

  const addSession = (sess: Omit<Session, "id">) => {
    const newSession: Session = { id: Date.now(), ...sess };
    const xpGained = 50; // Base XP for any session

    setSessions((prev) => [...prev, newSession]);
    
    if (user) {
      const isNewDay = user.lastActiveDate !== new Date().toDateString();
      setUser(prev => {
        if (!prev) return null;
        const newTodayXp = isNewDay ? xpGained : prev.todayXp + xpGained;
        const newTotalXp = prev.xp + xpGained;
        const newLevel = Math.floor(newTotalXp / 500) + 1;
        
        return {
          ...prev,
          xp: newTotalXp,
          level: newLevel,
          todayXp: newTodayXp,
          streak: isNewDay ? prev.streak + 1 : prev.streak,
          lastActiveDate: new Date().toDateString(),
        };
      });
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={styles.logo}>🎯 Confidence & Competence</span>
          {user && (
            <div style={styles.statsBar}>
              <span title="Streak">🔥 {user.streak}</span>
              <span title="Level">⭐ Lvl {user.level}</span>
              <span title="XP">💎 {user.xp} XP</span>
            </div>
          )}
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
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
            <select 
              value={user.language} 
              onChange={(e) => setUser({...user, language: e.target.value as any})}
              style={styles.langSelect}
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>
          </div>
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
          <Dashboard sessions={sessions} user={user} />
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

const styles = {
  wrap: {
    background: "#fff",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'din-round', 'proxima-nova', sans-serif",
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
    color: "#58cc02", // Duolingo Green
  } as React.CSSProperties,
  statsBar: {
    display: "flex",
    gap: 12,
    fontSize: 15,
    fontWeight: 700,
    color: "#4b4b4b",
    background: "#f7f7f7",
    padding: "6px 12px",
    borderRadius: 12,
  } as React.CSSProperties,
  nav: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    border: "none",
    borderRadius: 12,
    borderBottom: active ? "4px solid #1899D6" : "4px solid #e5e5e5",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    background: active ? "#1CB0F6" : "#fff",
    color: active ? "#fff" : "#777",
    transition: "all .1s",
    transform: active ? "translateY(2px)" : "none",
  }),
  langSelect: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "2px solid #e5e5e5",
    fontWeight: 700,
    color: "#4b4b4b",
    cursor: "pointer",
    outline: "none",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    boxShadow: "0 4px 12px rgba(0,0,0,.12)",
    minHeight: 500,
  } as React.CSSProperties,
};
