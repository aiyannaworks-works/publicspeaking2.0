"use client";

import { Session, UserData } from "@/lib/types";
import { StatCard, FeedbackRow } from "./ui";
import Leaderboard from "./Leaderboard";

export default function Dashboard({
  sessions,
  user,
}: {
  sessions: Session[];
  user: UserData;
}) {
  const streak = user.streak;
  const xpProgress = (user.todayXp / user.dailyGoalXp) * 100;
  const last30 = sessions.slice(-30);
  const avgConfidence = last30.length
    ? Math.round(
        last30.reduce((a, s) => a + (s.analysis?.confidenceScore ?? 0), 0) /
          last30.length
      )
    : 0;
  const fillerRate = last30.length
    ? (
        last30.reduce(
          (a, s) => a + parseFloat(s.analysis?.fillerRate ?? "0"),
          0
        ) / last30.length
      ).toFixed(2)
    : "0.00";
  const thisWeek = sessions.filter(
    (s) => new Date(s.date) > new Date(Date.now() - 7 * 864e5)
  ).length;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        Your Dashboard
      </h1>

      {/* Gamification Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontWeight: 700, color: "#4b4b4b" }}>Daily Goal Progress</h3>
          <span style={{ fontWeight: 700, color: "#58cc02" }}>{user.todayXp} / {user.dailyGoalXp} XP</span>
        </div>
        <div style={{ 
          width: "100%", 
          height: 24, 
          background: "#e5e5e5", 
          borderRadius: 12, 
          overflow: "hidden",
          borderBottom: "4px solid #d0d0d0"
        }}>
          <div style={{ 
            width: `${Math.min(xpProgress, 100)}%`, 
            height: "100%", 
            background: "#58cc02",
            transition: "width 0.5s ease-out"
          }} />
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Current Streak" value={streak} sub="days 🔥" />
        <StatCard label="Speech Fitness" value={avgConfidence} sub="30-day avg" />
        <StatCard label="Level" value={user.level} sub="Speaking Master" />
        <StatCard label="Total XP" value={user.xp} sub="All time 💎" />
      </div>

      <Leaderboard user={user} />

      {/* Insights */}
      {sessions.length > 0 ? (
        <div
          style={{
            background: "#f0f9ff",
            borderLeft: "4px solid #3b82f6",
            padding: 20,
            borderRadius: 8,
          }}
        >
          <h4 style={{ color: "#3b82f6", marginBottom: 10 }}>
            Recent Insights
          </h4>
          <FeedbackRow label="Your pace is improving" value="+12%" color="success" />
          <FeedbackRow label="Filler words decreasing" value="-18%" color="success" />
          <FeedbackRow
            label="Confidence trend"
            value="Upward"
            color="info"
          />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          <h3 style={{ marginBottom: 8 }}>Ready to start your journey?</h3>
          <p>
            Complete your first Rhythm Lab drill or Daily Game to see your
            progress here!
          </p>
        </div>
      )}
    </div>
  );
}
