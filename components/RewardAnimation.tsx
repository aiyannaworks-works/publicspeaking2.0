"use client";

import { useEffect, useState } from "react";

export function RewardAnimation({ xpGained }: { xpGained: number }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div style={styles.container}>
      <div style={styles.popUp}>
        <div style={styles.icon}>💎</div>
        <div style={styles.text}>+{xpGained} XP</div>
        <div style={styles.message}>Great job!</div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.confetti,
            left: `${20 + i * 15}%`,
            animation: `confetti 1.5s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {["🎉", "⭐", "🔥", "💪", "🎯"][i]}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none" as const,
    zIndex: 9999,
  },
  popUp: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    textAlign: "center" as const,
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  text: {
    fontSize: 32,
    fontWeight: 800,
    color: "#58cc02",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: 700,
    color: "#4b4b4b",
  },
  confetti: {
    position: "fixed" as const,
    fontSize: 24,
    top: "50%",
  },
};
