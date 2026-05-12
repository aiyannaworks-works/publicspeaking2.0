"use client";

import { UserData, Friend } from "@/lib/types";

export default function Leaderboard({ user }: { user: UserData }) {
  const allParticipants: (Friend | { name: string; xp: number; level: number; streak: number; isUser: boolean })[] = [
    ...user.friends,
    { name: user.name || "You", xp: user.xp, level: user.level, streak: user.streak, isUser: true }
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Leaderboard</h3>
      <div style={styles.list}>
        {allParticipants.map((p, i) => (
          <div key={i} style={{...styles.row, ...( (p as any).isUser ? styles.userRow : {})}}>
            <span style={styles.rank}>{i + 1}</span>
            <span style={styles.name}>{p.name} {(p as any).isUser && "(You)"}</span>
            <div style={styles.stats}>
              <span>⭐ {p.level}</span>
              <span style={styles.xp}>{p.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    borderRadius: 16,
    border: "2px solid #e5e5e5",
    padding: 20,
    marginTop: 20,
  } as React.CSSProperties,
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
    color: "#4b4b4b",
  } as React.CSSProperties,
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: 12,
    background: "#fff",
    border: "2px solid transparent",
  } as React.CSSProperties,
  userRow: {
    background: "#ddf4ff",
    border: "2px solid #84d8ff",
  } as React.CSSProperties,
  rank: {
    width: 24,
    fontWeight: 700,
    color: "#afafaf",
  } as React.CSSProperties,
  name: {
    flex: 1,
    fontWeight: 700,
    color: "#4b4b4b",
  } as React.CSSProperties,
  stats: {
    display: "flex",
    gap: 12,
    fontWeight: 700,
  } as React.CSSProperties,
  xp: {
    color: "#1cb0f6",
  } as React.CSSProperties,
};
