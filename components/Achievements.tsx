"use client";

import { UserData } from "@/lib/types";

export default function Achievements({ user }: { user: UserData }) {
  const achievements = [
    { id: "first_session", name: "First Steps", description: "Complete your first session", icon: "🎯", earned: true },
    { id: "level_5", name: "Rising Star", description: "Reach Level 5", icon: "⭐", earned: user.level >= 5 },
    { id: "level_10", name: "Pro Speaker", description: "Reach Level 10", icon: "🎤", earned: user.level >= 10 },
    { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "🔥", earned: user.streak >= 7 },
    { id: "streak_30", name: "Legend", description: "30-day streak", icon: "👑", earned: user.streak >= 30 },
    { id: "xp_500", name: "XP Collector", description: "Earn 500 XP", icon: "💎", earned: user.xp >= 500 },
    { id: "xp_2000", name: "XP Master", description: "Earn 2000 XP", icon: "💰", earned: user.xp >= 2000 },
    { id: "social", name: "Social Butterfly", description: "Add 5 friends", icon: "🦋", earned: user.friends.length >= 5 },
  ];

  const earnedCount = achievements.filter(a => a.earned).length;
  const progressPercent = (earnedCount / achievements.length) * 100;

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <h2 style={styles.title}>Achievements</h2>
      
      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Overall Progress</span>
          <span style={styles.progressCount}>{earnedCount} of {achievements.length}</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${progressPercent}%`}} />
        </div>
      </div>

      {/* Achievements Grid */}
      <div style={styles.grid}>
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            style={{...styles.badge, ...(achievement.earned ? styles.badgeEarned : styles.badgeLocked)}}
          >
            <div style={styles.badgeIcon}>{achievement.icon}</div>
            <div style={styles.badgeName}>{achievement.name}</div>
            <div style={styles.badgeDesc}>{achievement.description}</div>
            {achievement.earned && <div style={styles.checkmark}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: "#2a2a2a",
    marginBottom: 28,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "-0.5px",
  } as React.CSSProperties,
  progressSection: {
    marginBottom: 40,
    padding: 20,
    background: "#fafaf8",
    borderRadius: 8,
    border: "2px solid #e0e0e0",
  } as React.CSSProperties,
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  } as React.CSSProperties,
  progressLabel: {
    fontWeight: 700,
    color: "#2a2a2a",
    fontSize: 14,
  } as React.CSSProperties,
  progressCount: {
    fontWeight: 700,
    color: "#d97e3a",
    fontSize: 14,
  } as React.CSSProperties,
  progressBar: {
    width: "100%",
    height: 8,
    background: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  } as React.CSSProperties,
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #d97e3a, #6ba045)",
    transition: "width 0.5s ease-out",
    borderRadius: 4,
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 16,
  } as React.CSSProperties,
  badge: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    border: "2px solid #e0e0e0",
    textAlign: "center" as const,
    transition: "all 0.3s",
    position: "relative" as const,
  },
  badgeEarned: {
    background: "#fff9f0",
    borderColor: "#d97e3a",
    borderWidth: 3,
    boxShadow: "0 4px 12px rgba(217, 126, 58, 0.15)",
  } as React.CSSProperties,
  badgeLocked: {
    background: "#f5f5f5",
    borderColor: "#ddd",
    opacity: 0.5,
  } as React.CSSProperties,
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  } as React.CSSProperties,
  badgeName: {
    fontWeight: 800,
    color: "#2a2a2a",
    fontSize: 14,
    marginBottom: 4,
  } as React.CSSProperties,
  badgeDesc: {
    fontSize: 12,
    color: "#999",
    lineHeight: 1.3,
  } as React.CSSProperties,
  checkmark: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    background: "#6ba045",
    color: "#fff",
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 12,
  },
};
