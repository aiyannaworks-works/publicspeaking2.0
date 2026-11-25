"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, UserData } from "@/lib/types";
import { getTranslation, Language } from "@/lib/translations";
import { getCurrentUserProfile, addSessionRecord, getFriendsList } from "@/lib/auth-context";
import AuthSupabase from "@/components/AuthSupabase";
import Dashboard from "@/components/Dashboard";
import RhythmLab from "@/components/RhythmLab";
import DailyGames from "@/components/DailyGames";
import Progress from "@/components/Progress";
import Social from "@/components/Social";
import Achievements from "@/components/Achievements";
import { Btn } from "@/components/ui";
import { RewardAnimation } from "@/components/RewardAnimation";

type Tab = "home" | "rhythm" | "games" | "progress" | "social" | "achievements";

const supabase = createClient();

const createDemoUser = (): UserData => ({
  name: "Guest Speaker",
  goal: "",
  experience: "",
  baseline: 0,
  xp: 0,
  level: 1,
  streak: 0,
  dailyGoalXp: 50,
  todayXp: 0,
  lastActiveDate: new Date().toDateString(),
  language: "en",
  friends: [],
});

export default function App() {
  const [user, setUser] = useState<UserData | null>(createDemoUser());
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [lastXpGain, setLastXpGain] = useState(0);
  const [language, setLanguage] = useState<Language>("en");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const t = (key: string) => getTranslation(language, key);

  const [showAuth, setShowAuth] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const sessionRef = useRef<Session[]>([]);
  const saveQueue = useRef(Promise.resolve());
  const ownerRef = useRef<string | null>(null);
  const storageKey = (id: string | null) => `articulate:sessions:v2:${id || "guest"}`;
  const readLocal = (id: string | null): Session[] => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey(id)) || "[]");
      return Array.isArray(value) ? value.filter(s => s && s.id && s.date && ["rhythm-lab", "word-sprint", "one-minute-pitch"].includes(s.type)) : [];
    } catch { return []; }
  };
  const cache = (id: string | null, values: Session[]) => {
    try { localStorage.setItem(storageKey(id), JSON.stringify(values)); }
    catch { setSaveMessage("Browser storage is unavailable. Keep this tab open until your session is saved to your account."); }
  };
  const applySessions = (id: string | null, values: Session[]) => {
    if (ownerRef.current !== id) return;
    sessionRef.current = values; setSessions(values); cache(id, values);
    const today = new Date().toDateString();
    const days = new Set(values.map(s => new Date(s.date).toDateString()));
    let streak = 0; const day = new Date();
    if (!days.has(day.toDateString())) day.setDate(day.getDate() - 1);
    while (days.has(day.toDateString())) { streak++; day.setDate(day.getDate() - 1); }
    setUser(prev => {
      const xp = values.length * 50;
      return { ...(prev || createDemoUser()), xp, level: Math.floor(xp / 500) + 1, streak,
        todayXp: values.filter(s => new Date(s.date).toDateString() === today).length * 50 };
    });
  };
  const loadProgress = async (id: string | null) => {
    const local = readLocal(id); applySessions(id, local);
    if (!id) return;
    const { data, error } = await supabase.from("sessions").select("*").eq("user_id", id).order("created_at", { ascending: true });
    if (ownerRef.current !== id) return;
    if (error) { setSaveMessage("Could not load account history. Showing this device's saved sessions. Try again shortly."); return; }
    const remote: Session[] = (data || []).map((row: any) => ({
      id: row.id, type: row.type, date: row.created_at, drill: row.drill_id,
      drillName: row.drill_name, transcript: row.transcript || "",
      duration: row.analysis?._session?.duration || row.analysis?.duration,
      topic: row.analysis?._session?.topic, wordsTyped: row.analysis?._session?.wordsTyped,
      analysis: row.analysis?.measured ? row.analysis : undefined,
    }));
    const remoteIds = new Set(remote.map(row => String(row.id)));
    const pending = local.filter(row => !remoteIds.has(String(row.id)));
    const merged = [...remote, ...pending].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    applySessions(id, merged);
    if (pending.length) setSaveMessage("Some sessions are saved on this device and still need to sync. Use Retry sync.");
    const { friends } = await getFriendsList(id);
    if (ownerRef.current === id) setUser(prev => prev ? { ...prev, friends: (friends || []).map((f: any) => ({ id: f.profiles?.id, name: f.profiles?.username, xp: f.profiles?.xp || 0, level: f.profiles?.level || 1, streak: f.profiles?.streak || 0 })).filter((f: any) => f.id) } : prev);
  };
  useEffect(() => {
    let alive = true;
    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const id = data.session?.user.id || null;
        if (!alive) return;
        ownerRef.current = id; setUserId(id);
        if (id) {
          const { profile } = await getCurrentUserProfile(id);
          if (!alive) return;
          if (profile) { setLanguage(profile.language || "en"); setUser({ ...createDemoUser(), name: profile.full_name || profile.username || "Speaker", language: profile.language || "en" }); }
        }
        await loadProgress(id);
      } catch { if (alive) { ownerRef.current = null; setUserId(null); await loadProgress(null); setSaveMessage("Account connection unavailable. Guest progress is saved on this device."); } }
      finally { if (alive) setIsLoading(false); }
    };
    void initialize(); return () => { alive = false; };
  }, []);

  const handleAuthSuccess = async (id: string, profile: any) => {
    ownerRef.current = id; setUserId(id); setShowAuth(false); setSaveMessage("");
    setLanguage(profile.language || "en");
    setUser({ ...createDemoUser(), name: profile.full_name || profile.username || "Speaker", language: profile.language || "en" });
    await loadProgress(id); setTab("home");
  };
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { setSaveMessage("Could not sign out. Please try again."); return; }
    ownerRef.current = null; setUserId(null); setUser(createDemoUser()); setSaveMessage("");
    await loadProgress(null); setTab("home"); setMobileMoreOpen(false);
  };
  const persistSession = async (id: string, sess: Session) => {
    const { error } = await addSessionRecord(id, {
      id: String(sess.id), created_at: sess.date, type: sess.type,
      drill_id: sess.drill || sess.type, drill_name: sess.drillName || sess.type,
      transcript: sess.transcript,
      analysis: { ...sess.analysis, _session: { duration: sess.duration, topic: sess.topic, wordsTyped: sess.wordsTyped } }, xp_gained: 50,
    });
    if (ownerRef.current === id) setSaveMessage(error ? "Saved on this device. Account sync failed; use Retry sync." : "Saved to your account.");
    return !error;
  };
  const addSession = (sess: Omit<Session, "id">) => {
    const id = ownerRef.current;
    const newSession: Session = { id: crypto.randomUUID(), ...sess };
    const values = [...sessionRef.current, newSession];
    applySessions(id, values); setLastXpGain(50); setShowReward(true);
    setSaveMessage(id ? "Saving to your account…" : "Saved on this device. Sign in to keep separate account progress.");
    if (id) saveQueue.current = saveQueue.current.then(() => persistSession(id, newSession)).catch(() => { setSaveMessage("Saved on this device. Account sync failed; use Retry sync."); });
  };
  const retrySync = () => {
    const id = ownerRef.current; if (!id) return;
    setSaveMessage("Syncing saved sessions…");
    const values = [...sessionRef.current];
    saveQueue.current = saveQueue.current.then(async () => { let allSaved = true; for (const sess of values) { if (!await persistSession(id, sess)) allSaved = false; } if (ownerRef.current === id) setSaveMessage(allSaved ? "Saved to your account." : "Some sessions could not sync. They remain on this device; try again later."); }).catch(() => setSaveMessage("Account sync is unavailable. Your sessions remain on this device."));
  };

  const NAV: { id: Tab; label: string; shortLabel: string; icon: string }[] = [
    { id: "home", label: t("nav.dashboard"), shortLabel: "Home", icon: "⌂" },
    { id: "rhythm", label: t("nav.rhythmlab"), shortLabel: "Practice", icon: "🎙" },
    { id: "games", label: t("nav.dailygames"), shortLabel: "Games", icon: "⚡" },
    { id: "progress", label: t("nav.progress"), shortLabel: "Progress", icon: "↗" },
    { id: "social", label: t("nav.social"), shortLabel: "Social", icon: "♟" },
    { id: "achievements", label: t("nav.achievements"), shortLabel: "Awards", icon: "★" },
  ];
  const PRIMARY_MOBILE_NAV = NAV.slice(0, 4);

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

  if (showAuth) return <div><Btn variant="secondary" onClick={() => setShowAuth(false)}>← Back to practice</Btn><AuthSupabase onAuthSuccess={handleAuthSuccess} /></div>;

  return (
    <div className="app-shell" style={styles.wrap}>
      {/* Header */}
      <header className="app-header" style={styles.header}>
        <div className="app-identity" style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={styles.logo}>
            <span style={{ fontSize: 18 }}>🎙</span>
            <span className="articulate-wordmark">Articulate</span>
          </span>
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
            <button onClick={userId ? handleSignOut : () => setShowAuth(true)} style={styles.signOutBtn}>
              {userId ? "Sign Out" : "Sign in"}
            </button>
          </div>
        )}
      </header>

      {saveMessage && <p role="status" style={{ marginBottom: 16 }}>{saveMessage} {userId && <button onClick={retrySync}>Retry sync</button>}</p>}
      {/* Main content */}
      <main className="app-card" style={{ ...styles.card, animation: "fadeIn 0.3s ease-out" }}>
        {showReward && <RewardAnimation key={sessions.length} xpGained={lastXpGain} />}
        {tab === "home" ? (
          <Dashboard sessions={sessions} user={user || createDemoUser()} onStartPractice={() => setTab("rhythm")} />
        ) : tab === "rhythm" ? (
          <RhythmLab addSession={addSession} />
        ) : tab === "games" ? (
          <DailyGames addSession={addSession} />
        ) : tab === "progress" ? (
          <Progress sessions={sessions} onStartPractice={() => setTab("rhythm")} />
        ) : tab === "social" ? (
          <Social user={user || createDemoUser()} userId={userId} onFriendsChanged={() => void loadProgress(userId)} />
        ) : (
          <Achievements user={user || createDemoUser()} sessionsCount={sessions.length} />
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {PRIMARY_MOBILE_NAV.map(({ id, shortLabel, icon }) => (
          <button
            key={id}
            className={tab === id ? "mobile-nav-item active" : "mobile-nav-item"}
            onClick={() => {
              setTab(id);
              setMobileMoreOpen(false);
            }}
            aria-current={tab === id ? "page" : undefined}
          >
            <span aria-hidden="true">{icon}</span>
            <span>{shortLabel}</span>
          </button>
        ))}
        <button
          className={tab === "social" || tab === "achievements" ? "mobile-nav-item active" : "mobile-nav-item"}
          onClick={() => setMobileMoreOpen((open) => !open)}
          aria-expanded={mobileMoreOpen}
        >
          <span aria-hidden="true">•••</span>
          <span>More</span>
        </button>
      </nav>

      {mobileMoreOpen && (
        <div className="mobile-more-panel">
          <div className="mobile-more-card">
            <p className="mobile-more-title">More</p>
            {NAV.slice(4).map(({ id, label, icon }) => (
              <button
                key={id}
                className="mobile-more-action"
                onClick={() => {
                  setTab(id);
                  setMobileMoreOpen(false);
                }}
              >
                <span aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
            <label className="mobile-language">
              <span>Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
              </select>
            </label>
            <button className="mobile-sign-out" onClick={userId ? handleSignOut : () => { setShowAuth(true); setMobileMoreOpen(false); }}>{userId ? "Sign Out" : "Sign in"}</button>
          </div>
          <button
            className="mobile-more-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileMoreOpen(false)}
          />
        </div>
      )}
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
