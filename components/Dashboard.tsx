"use client";

import { Session, UserData } from "@/lib/types";
import { Btn, StatCard, FeedbackRow, InfoCard, T } from "./ui";
import Leaderboard from "./Leaderboard";

export default function Dashboard({
  sessions,
  user,
  onStartPractice,
}: {
  sessions: Session[];
  user: UserData;
  onStartPractice?: () => void;
}) {
  const xpProgress = Math.min((user.todayXp / user.dailyGoalXp) * 100, 100);
  const last30 = sessions.slice(-30);
  const avgConfidence = last30.length
    ? Math.round(
        last30.reduce((a, s) => a + (s.analysis?.confidenceScore ?? 0), 0) /
          last30.length
      )
    : 0;
  const thisWeek = sessions.filter(
    (s) => new Date(s.date) > new Date(Date.now() - 7 * 864e5)
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Hero: greeting + daily goal ── */}
      <div className="dashboard-hero" style={s.hero}>
        <div>
          <p style={s.heroEyebrow}>Good to see you back</p>
          <h1 style={s.heroName}>{user.name || "Speaker"} 👋</h1>
        </div>
        <div style={s.levelBadge}>
          <span style={s.levelLabel}>Level</span>
          <span style={s.levelNum}>{user.level}</span>
        </div>
      </div>

      {/* ── Daily XP progress ── */}
      <div style={s.xpCard}>
        <div className="dashboard-xp-top" style={s.xpTop}>
          <div>
            <p style={s.xpLabel}>Daily goal</p>
            <p style={s.xpSub}>Keep your streak alive 🔥</p>
          </div>
          <div style={s.xpCount}>
            <span style={{ color: T.green, fontWeight: 800 }}>{user.todayXp}</span>
            <span style={{ color: T.ink4, fontWeight: 600 }}>/{user.dailyGoalXp} XP</span>
          </div>
        </div>
        <div style={s.track}>
          <div style={{ ...s.fill, width: `${xpProgress}%` }} />
        </div>
        {xpProgress >= 100 && (
          <p style={{ fontSize: 13, color: T.green, fontWeight: 700, marginTop: 8 }}>
            ✓ Daily goal complete!
          </p>
        )}
      </div>

      {/* ── Stat grid ── */}
      <div style={s.statGrid}>
        <StatCard label="Streak"         value={`${user.streak}d`}    sub="Keep it going 🔥" accent="orange" />
        <StatCard label="Speech Fitness" value={avgConfidence || "—"} sub="30-day avg"        accent="green" />
        <StatCard label="This Week"      value={thisWeek}             sub="sessions"          accent="orange" />
        <StatCard label="Total XP"       value={user.xp}              sub="all time 💎"       accent="green" />
      </div>

      {/* ── Leaderboard ── */}
      <Leaderboard user={user} />

      {/* ── Compete card ── */}
      <div className="dashboard-compete" style={s.competeCard}>
        <div style={s.competeIcon}>🏆</div>
        <div>
          <h3 style={s.competeTitle}>Compete with Friends</h3>
          <p style={s.competeText}>
            Join the Weekly League and climb the ranks. Check the Social tab to
            see who's leading!
          </p>
        </div>
      </div>

      {/* ── Insights ── */}
      {sessions.length > 0 ? (
        <InfoCard accent="green">
          <h4 style={{ color: T.greenDark, fontWeight: 800, marginBottom: 12, fontSize: 15 }}>
            📊 Recent Insights
          </h4>
          <FeedbackRow label="Your pace is improving"    value="+12%"   color="success" />
          <FeedbackRow label="Filler words decreasing"   value="−18%"   color="success" />
          <FeedbackRow label="Confidence trend"          value="Upward"  color="success" />
        </InfoCard>
      ) : (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>🎙</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 8 }}>
            Ready to start?
          </h3>
          <p style={{ fontSize: 14, color: T.ink3, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            Complete your first Rhythm Lab drill or Daily Game to see your
            progress here.
          </p>
          <Btn onClick={onStartPractice ?? (() => {})} style={{ marginTop: 20 }}>
            Start your first practice →
          </Btn>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: 600,
    color: T.ink4,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 4,
  },
  heroName: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    color: T.ink,
    letterSpacing: "-0.03em",
    margin: 0,
  },
  levelBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: T.orangeLight,
    borderRadius: 14,
    padding: "10px 18px",
    flexShrink: 0,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: T.orangeDark,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  levelNum: {
    fontSize: 26,
    fontWeight: 800,
    color: T.orange,
    fontFamily: "'Bricolage Grotesque', sans-serif",
    lineHeight: 1.1,
  },
  xpCard: {
    background: T.white,
    borderRadius: 16,
    padding: "20px 24px",
    border: `1.5px solid ${T.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  xpTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  xpLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: T.ink,
    marginBottom: 2,
  },
  xpSub: {
    fontSize: 13,
    color: T.ink4,
  },
  xpCount: {
    fontSize: 16,
    display: "flex",
    gap: 2,
    alignItems: "baseline",
  },
  track: {
    width: "100%",
    height: 10,
    background: T.border,
    borderRadius: 9999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    background: `linear-gradient(90deg, ${T.orange}, ${T.green})`,
    borderRadius: 9999,
    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
  },
  competeCard: {
    background: T.white,
    border: `1.5px solid ${T.border}`,
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  competeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: T.orangeLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  competeTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: T.ink,
    marginBottom: 4,
  },
  competeText: {
    fontSize: 13,
    color: T.ink3,
    lineHeight: 1.6,
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    background: T.surface,
    borderRadius: 16,
    border: `1.5px dashed ${T.border}`,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 16,
  },
};
