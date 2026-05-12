"use client";

import { Session } from "@/lib/types";
import { StatCard, FeedbackRow } from "./ui";

export default function Dashboard({
  sessions,
  streak,
}: {
  sessions: Session[];
  streak: number;
}) {
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

      {/* Streak */}
      <div
        style={{
          textAlign: "center",
          padding: 28,
          background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
          color: "#fff",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700 }}>🔥 {streak}</div>
        <div style={{ fontWeight: 600 }}>Day Streak</div>
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
        <StatCard label="Speech Fitness" value={avgConfidence} sub="30-day avg" />
        <StatCard label="Total Sessions" value={sessions.length} sub="All time" />
        <StatCard label="Filler Rate" value={fillerRate} sub="per min" />
        <StatCard label="This Week" value={thisWeek} sub="sessions" />
      </div>

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
