"use client";

import { Session } from "@/lib/types";
import { Badge, StatCard } from "./ui";

const orange = "#d97e3a";

export default function Progress({ sessions }: { sessions: Session[] }) {
  const last30 = sessions.slice(-30);
  const score = last30.length
    ? Math.round(
        last30.reduce((a, s) => a + (s.analysis?.confidenceScore ?? 0), 0) /
          last30.length
      )
    : 0;

  const thisMonth = sessions.filter(
    (s) => new Date(s.date) > new Date(Date.now() - 30 * 864e5)
  ).length;

  const pct = score * 3.6; // degrees for conic-gradient

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        Your Progress
      </h1>

      {/* Fitness score ring */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2 style={{ color: orange, marginBottom: 16 }}>
          Speech Fitness Score
        </h2>
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            margin: "0 auto 16px",
            background: `conic-gradient(${orange} ${pct}deg, #e0e0e0 ${pct}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 144,
              height: 144,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 700, color: orange }}>
              {score}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>out of 100</div>
          </div>
        </div>
        <p style={{ color: "#666" }}>Based on your last 30 days</p>
      </div>

      {/* Trend stats */}
      {sessions.length > 0 && (
        <>
          <h3 style={{ marginBottom: 14 }}>Improvement Trends</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 14,
              marginBottom: 32,
            }}
          >
            <StatCard label="Avg Confidence" value={score} />
            <StatCard label="This Month" value={thisMonth} sub="sessions" />
            <StatCard label="All Time" value={sessions.length} sub="sessions" />
          </div>
        </>
      )}

      {/* Session history */}
      <h3 style={{ marginBottom: 14 }}>Recent Sessions</h3>
      {sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          No sessions yet. Start practising to see your progress!
        </div>
      ) : (
        sessions
          .slice(-10)
          .reverse()
          .map((sess) => (
            <div
              key={sess.id}
              style={{
                background: "#fff",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                padding: 20,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    style={{ color: orange, fontWeight: 700, marginBottom: 4 }}
                  >
                    {sess.type === "rhythm-lab" && `🎯 ${sess.drillName}`}
                    {sess.type === "word-sprint" && "⚡ Word Sprint"}
                    {sess.type === "one-minute-pitch" && "🎤 One-Minute Pitch"}
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {new Date(sess.date).toLocaleDateString()} at{" "}
                    {new Date(sess.date).toLocaleTimeString()}
                  </div>
                </div>
                {sess.analysis && (
                  <Badge color="success">
                    Score: {sess.analysis.confidenceScore}
                  </Badge>
                )}
              </div>

              {sess.analysis && sess.type !== "word-sprint" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge color="info">Pace: {sess.analysis.pace} WPM</Badge>
                  <Badge color="info">
                    Fillers: {sess.analysis.fillerWords}
                  </Badge>
                  <Badge color="info">
                    Avg Pause: {sess.analysis.avgPause}s
                  </Badge>
                </div>
              )}
              {sess.type === "word-sprint" && sess.wordsTyped !== undefined && (
                <Badge color="info">Words: {sess.wordsTyped}</Badge>
              )}
            </div>
          ))
      )}
    </div>
  );
}
