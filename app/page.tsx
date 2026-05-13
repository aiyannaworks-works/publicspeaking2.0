"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Session, UserData } from "@/lib/types";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import RhythmLab from "@/components/RhythmLab";
import DailyGames from "@/components/DailyGames";
import Progress from "@/components/Progress";
import Social from "@/components/Social";
import Achievements from "@/components/Achievements";
import { RewardAnimation } from "@/components/RewardAnimation";

type Tab = "home" | "rhythm" | "games" | "progress" | "social" | "achievements";

const purple = "#667eea";

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [lastXpGain, setLastXpGain] = useState(0);

  // Load data from localStorage on mount and detect new day
  useEffect(() => {
    const savedUser = storage.getUser();
    const savedSessions = storage.getSessions();
    
    if (savedUser) {
      const today = new Date().toDateString();
      const lastActive = savedUser.lastActiveDate;
      const isNewDay = lastActive !== today;
      
      if (isNewDay) {
        // Calculate if streak should be broken (more than 1 day gap)
        const lastDate = new Date(lastActive);
        const currentDate = new Date();
        const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // If more than 1 day has passed, break the streak
        const newStreak = daysDiff === 1 ? savedUser.streak : 0;
        
        const updatedUser = {
          ...savedUser,
          todayXp: 0,
          lastActiveDate: today,
          streak: newStreak,
        };
        
        setUser(updatedUser);
        storage.saveUser(updatedUser);
      } else {
        setUser(savedUser);
      }
      
      setSessions(savedSessions);
    }
    setIsLoading(false);
  }, []);

  // Auto-save user data whenever it changes
  useEffect(() => {
    if (user) {
      storage.saveUser(user);
    }
  }, [user]);

  // Auto-save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      storage.saveSessions(sessions);
    }
  }, [sessions]);

  const addSession = (sess: Omit<Session, "id">) => {
    const newSession: Session = { id: Date.now(), ...sess };
    const xpGained = 50; // Base XP for any session

    setSessions((prev) => [...prev, newSession]);
    setLastXpGain(xpGained);
    setShowReward(true);
    
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
    { id: "social", label: "Social" },
    { id: "achievements", label: "Achievements" },
  ];

  if (isLoading) {
    return (
      <div style={{ ...styles.wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <p style={{ color: "#666", fontWeight: 700 }}>Loading your progress...</p>
          </div>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={{...styles.wrap, ...(isMobile ? styles.wrapMobile : {})}}>
      {/* Header */}
      <header style={{...styles.header, marginBottom: isMobile ? 20 : 40, paddingBottom: isMobile ? 12 : 20}}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={styles.logo}>Articulate</span>
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
      <main style={{...styles.card, ...(isMobile ? styles.cardMobile : {}), animation: "fadeIn 0.3s ease-out"}}>
        {showReward && <RewardAnimation xpGained={lastXpGain} />}
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
        ) : tab === "progress" ? (
          <Progress sessions={sessions} />
        ) : tab === "social" ? (
          <Social user={user} />
        ) : (
          <Achievements user={user} />
        )}
      </main>
    </div>
  );
}

const styles = {
  wrap: {
    background: "#fafaf8",
    minHeight: "100vh",
    padding: "40px 20px",
    maxWidth: 1200,
    margin: "0 auto",
  } as React.CSSProperties,
  wrapMobile: {
    padding: "20px 12px",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 20,
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: "3px solid #e0e0e0",
  } as React.CSSProperties,
  logo: {
    fontSize: 28,
    fontWeight: 900,
    color: "#2a2a2a",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "-1px",
  } as React.CSSProperties,
  statsBar: {
    display: "flex",
    gap: 24,
    fontSize: 14,
    fontWeight: 700,
    color: "#2a2a2a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  nav: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "10px 18px",
    border: "2px solid" + (active ? " #d97e3a" : " #e0e0e0"),
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    background: active ? "#d97e3a" : "#fff",
    color: active ? "#fff" : "#2a2a2a",
    transition: "all 0.2s",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  }),
  langSelect: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "2px solid #e0e0e0",
    fontWeight: 700,
    color: "#2a2a2a",
    cursor: "pointer",
    outline: "none",
    fontSize: 13,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 40,
    border: "2px solid #e0e0e0",
    minHeight: 500,
  } as React.CSSProperties,
  cardMobile: {
    padding: 20,
    borderRadius: 10,
    minHeight: 400,
  } as React.CSSProperties,
};
