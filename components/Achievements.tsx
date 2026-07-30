"use client";

import { UserData } from "@/lib/types";
import { T } from "./ui";

export default function Achievements({
  user,
  sessionsCount,
}: {
  user: UserData;
  sessionsCount?: number;
}) {
  const achievements = [
    { id: "first_session", name: "First Steps", description: "Complete your first session", icon: "🎯", earned: (sessionsCount ?? 0) > 0 },
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
    fontWeight: 800,
    color: T.ink,
    marginBottom: 28,
    fontFamily: "'Bricolage Grotesque', sans-serif",
    letterSpacing: "-0.03em",
  } as React.CSSProperties,
  progressSection: {
    marginBottom: 40,
    padding: 20,
    background: T.surface,
    borderRadius: 16,
    border: `1.5px solid ${T.border}`,
  } as React.CSSProperties,
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  } as React.CSSProperties,
  progressLabel: {
    fontWeight: 700,
    color: T.ink,
    fontSize: 14,
  } as React.CSSProperties,
  progressCount: {
    fontWeight: 700,
    color: T.orange,
    fontSize: 14,
  } as React.CSSProperties,
  progressBar: {
    width: "100%",
    height: 8,
    background: T.border,
    borderRadius: 4,
    overflow: "hidden",
  } as React.CSSProperties,
  progressFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${T.orange}, ${T.green})`,
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
    border: `1.5px solid ${T.border}`,
    textAlign: "center" as const,
    transition: "all 0.3s",
    position: "relative" as const,
  },
  badgeEarned: {
    background: T.orangeLight,
    borderColor: T.orange,
    boxShadow: "0 4px 12px rgba(232,115,42,0.12)",
  } as React.CSSProperties,
  badgeLocked: {
    background: T.surface,
    borderColor: T.border,
    opacity: 0.62,
  } as React.CSSProperties,
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  } as React.CSSProperties,
  badgeName: {
    fontWeight: 800,
    color: T.ink,
    fontSize: 14,
    marginBottom: 4,
  } as React.CSSProperties,
  badgeDesc: {
    fontSize: 12,
    color: T.ink3,
    lineHeight: 1.3,
  } as React.CSSProperties,
  checkmark: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    background: T.green,
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
