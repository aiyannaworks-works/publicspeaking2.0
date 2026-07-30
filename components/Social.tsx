"use client";

import { UserData } from "@/lib/types";

export default function Social({ user }: { user: UserData }) {
  const activities = [
    { name: "Duo", action: "Completed Rhythm Lab", xp: 50, time: "2 mins ago", icon: "🎵" },
    { name: "Lily", action: "Earned 'Speed Demon' badge", xp: 0, time: "15 mins ago", icon: "⚡" },
    { name: "Zari", action: "Reached Level 22", xp: 0, time: "1 hour ago", icon: "⭐" },
    { name: "You", action: "Completed Daily Games", xp: 50, time: "Just now", icon: "🎮" },
  ];

  const weeklyLeague = [
    ...user.friends,
    { id: "you", name: user.name || "You", xp: user.xp, level: user.level, streak: user.streak }
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Weekly League */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Weekly League</h2>
        <p style={styles.subtitle}>This week's top performers</p>
        
        <div style={styles.leagueContainer}>
          {weeklyLeague.map((person, i) => (
            <div className="social-row" key={i} style={{...styles.leagueRow, ...( (person as any).id === "you" ? styles.userHighlight : {})}}>
              <div style={styles.rank}>
                {i === 0 && "🥇"}
                {i === 1 && "🥈"}
                {i === 2 && "🥉"}
                {i > 2 && `#${i + 1}`}
              </div>
              <div style={styles.personInfo}>
                <div style={styles.personName}>{person.name} {(person as any).id === "you" && "(You)"}</div>
                <div style={styles.personStats}>
                  {person.streak} day streak • Level {person.level}
                </div>
              </div>
              <div style={styles.xpBadge}>{person.xp} XP</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Activity Feed</h2>
        <p style={styles.subtitle}>What your friends are up to</p>
        
        <div style={styles.feedContainer}>
          {activities.map((activity, i) => (
            <div className="social-row" key={i} style={styles.feedItem}>
              <div style={styles.feedIcon}>{activity.icon}</div>
              <div style={styles.feedContent}>
                <div style={styles.feedText}>
                  <strong>{activity.name}</strong> {activity.action}
                </div>
                <div style={styles.feedTime}>{activity.time}</div>
              </div>
              {activity.xp > 0 && (
                <div style={styles.feedXp}>+{activity.xp} XP</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Friends */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Add Friends</h2>
        <p style={styles.subtitle}>Invite friends to compete and grow together!</p>
        <div style={styles.addFriendsContainer}>
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            style={styles.searchInputLarge}
          />
          <button style={styles.searchBtnLarge}>Search</button>
        </div>
        <p style={styles.friendHint}>💡 When you add real friends, they'll appear here with their progress!</p>
      </div>
    </div>
  );
}

const styles = {
  section: {
    marginBottom: 40,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#2a2a2a",
    marginBottom: 4,
    fontFamily: "'Syne', sans-serif",
  } as React.CSSProperties,
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    fontWeight: 500,
  } as React.CSSProperties,
  leagueContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  leagueRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 16,
    background: "#fafaf8",
    borderRadius: 8,
    border: "2px solid #e0e0e0",
    transition: "all 0.2s",
  } as React.CSSProperties,
  userHighlight: {
    background: "#fff9f0",
    borderColor: "#d97e3a",
    borderWidth: 3,
  } as React.CSSProperties,
  rank: {
    fontSize: 20,
    fontWeight: 800,
    minWidth: 32,
    textAlign: "center" as const,
  },
  personInfo: {
    flex: 1,
  } as React.CSSProperties,
  personName: {
    fontWeight: 700,
    color: "#2a2a2a",
    fontSize: 15,
  } as React.CSSProperties,
  personStats: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  } as React.CSSProperties,
  xpBadge: {
    background: "#d97e3a",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
  } as React.CSSProperties,
  feedContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  feedItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    background: "#fafaf8",
    borderRadius: 8,
    border: "2px solid #e0e0e0",
  } as React.CSSProperties,
  feedIcon: {
    fontSize: 24,
  } as React.CSSProperties,
  feedContent: {
    flex: 1,
  } as React.CSSProperties,
  feedText: {
    fontSize: 14,
    color: "#2a2a2a",
    lineHeight: 1.4,
  } as React.CSSProperties,
  feedTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  } as React.CSSProperties,
  feedXp: {
    background: "#6ba045",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 12,
  } as React.CSSProperties,
  addFriendsBox: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  } as React.CSSProperties,
  addFriendsContainer: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexDirection: "column" as const,
  } as React.CSSProperties,
  searchInput: {
    flex: 1,
    padding: 12,
    border: "2px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  searchInputLarge: {
    padding: 18,
    border: "3px solid #d97e3a",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    color: "#2a2a2a",
    transition: "all 0.2s",
  } as React.CSSProperties,
  searchBtn: {
    padding: "12px 24px",
    background: "#d97e3a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    transition: "all 0.2s",
  } as React.CSSProperties,
  searchBtnLarge: {
    padding: "16px 32px",
    background: "#d97e3a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 16,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(217, 126, 58, 0.2)",
  } as React.CSSProperties,
  friendHint: {
    fontSize: 14,
    color: "#666",
    fontStyle: "normal",
    marginTop: 12,
    lineHeight: 1.6,
  } as React.CSSProperties,
};
