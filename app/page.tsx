"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, UserData } from "@/lib/types";
import { getTranslation, Language } from "@/lib/translations";
import { getCurrentUserProfile, getWeeklyLeaderboard, addSessionRecord, getWeekStart } from "@/lib/auth-context";
import AuthSupabase from "@/components/AuthSupabase";
import Dashboard from "@/components/Dashboard";
import RhythmLab from "@/components/RhythmLab";
import DailyGames from "@/components/DailyGames";
import Progress from "@/components/Progress";
import Social from "@/components/Social";
import Achievements from "@/components/Achievements";
import { RewardAnimation } from "@/components/RewardAnimation";

type Tab = "home" | "rhythm" | "games" | "progress" | "social" | "achievements";

const supabase = createClient();

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [lastXpGain, setLastXpGain] = useState(0);
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => getTranslation(language, key);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          setUserId(data.session.user.id);
          const { profile } = await getCurrentUserProfile(data.session.user.id);
          if (profile) {
            setLanguage(profile.language || "en");
            const userData: UserData = {
              name: profile.full_name || "",
              goal: "",
              experience: "",
              baseline: 0,
              xp: profile.xp || 0,
              level: profile.level || 1,
              streak: profile.streak || 0,
              dailyGoalXp: 50,
              todayXp: 0,
              lastActiveDate: profile.last_active_date || new Date().toDateString(),
              language: profile.language || "en",
              friends: [],
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = async (newUserId: string, profile: any) => {
    setUserId(newUserId);
    setLanguage(profile.language || "en");
    const userData: UserData = {
      name: profile.full_name || "",
      goal: "",
      experience: "",
      baseline: 0,
      xp: profile.xp || 0,
      level: profile.level || 1,
      streak: profile.streak || 0,
      dailyGoalXp: 50,
      todayXp: 0,
      lastActiveDate: profile.last_active_date || new Date().toDateString(),
      language: profile.language || "en",
      friends: [],
    };
    setUser(userData);
    setTab("home");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserId(null);
    setSessions([]);
  };

  const addSession = async (sess: Omit<Session, "id">) => {
    if (!userId) return;

    const newSession: Session = { id: Date.now(), ...sess };
    const xpGained = 50;

    setSessions((prev) => [...prev, newSession]);
    setLastXpGain(xpGained);
    setShowReward(true);

    // Save to Supabase
    await addSessionRecord(userId, {
      type: sess.type,
      drill_id: sess.type,
      drill_name: sess.type,
      xp_gained: xpGained,
    });

    // Update local user state
    if (user) {
      const newTotalXp = user.xp + xpGained;
      const newLevel = Math.floor(newTotalXp / 500) + 1;

      setUser({
        ...user,
        xp: newTotalXp,
        level: newLevel,
        todayXp: user.todayXp + xpGained,
      });
    }
  };

  const NAV: { id: Tab; label: string }[] = [
    { id: "home", label: t("nav.dashboard") },
    { id: "rhythm", label: t("nav.rhythmlab") },
    { id: "games", label: t("nav.dailygames") },
    { id: "progress", label: t("nav.progress") },
    { id: "social", label: t("nav.social") },
    { id: "achievements", label: t("nav.achievements") },
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

  if (!user) {
    return <AuthSupabase onAuthSuccess={handleAuthSuccess} t={t} />;
  }

  return (
    <div className="app-shell" style={styles.wrap}>
      {/* Header */}
      <header className="app-header" style={styles.header}>
        <div className="app-identity" style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={styles.logo}><span style={{ fontSize: 18 }}>🎙</span> Articulate</span>
          {user && (
            <div className="app-stats" style={styles.statsBar}>
              <span title="Streak">🔥 {user.streak}</span>
              <span title="Level">⭐ Lvl {user.level}</span>
              <span title="XP">💎 {user.xp} XP</span>
            </div>
          )}
        </div>
        {user && (
          <div className="app-controls" style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <nav className="app-nav" style={styles.nav} aria-label="Primary navigation">
              {NAV.map(({ id, label }) => (
                <button key={id} style={styles.tab(tab === id)} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </nav>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as Language;
                setLanguage(newLang);
              }}
              style={styles.langSelect}
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>
            <button onClick={handleSignOut} style={styles.signOutBtn}>
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="app-card" style={{ ...styles.card, animation: "fadeIn 0.3s ease-out" }}>
        {showReward && <RewardAnimation xpGained={lastXpGain} />}
        {tab === "home" ? (
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
    background: "#F7F7F5",
    minHeight: "100vh",
    padding: "32px 24px",
    maxWidth: 1100,
    margin: "0 auto",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 16,
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "1.5px solid #E8E8E8",
  } as React.CSSProperties,
  logo: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1A1A1A",
    fontFamily: "'Bricolage Grotesque', sans-serif",
    letterSpacing: "-0.04em",
    display: "flex",
    alignItems: "center",
    gap: 8,
  } as React.CSSProperties,
  statsBar: {
    display: "flex",
    gap: 20,
    fontSize: 13,
    fontWeight: 700,
    color: "#3D3D3D",
    letterSpacing: "0.01em",
  } as React.CSSProperties,
  nav: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap" as const,
    background: "#EFEFED",
    borderRadius: 12,
    padding: 4,
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    background: active ? "#E8732A" : "transparent",
    color: active ? "#fff" : "#6B6B6B",
    transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
    letterSpacing: "0.01em",
    boxShadow: active ? "0 2px 6px rgba(232,115,42,0.30)" : "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }),
  langSelect: {
    padding: "8px 12px",
    border: "1.5px solid #E8E8E8",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: "#fff",
    color: "#1A1A1A",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  } as React.CSSProperties,
  signOutBtn: {
    padding: "8px 16px",
    border: "1.5px solid #E8E8E8",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    background: "#fff",
    color: "#D93025",
    transition: "all 0.18s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 36,
    border: "1.5px solid #E8E8E8",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  } as React.CSSProperties,
};
