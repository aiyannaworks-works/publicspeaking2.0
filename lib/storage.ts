import { UserData, Session } from "./types";

const STORAGE_KEYS = {
  USER: "confidence_user",
  SESSIONS: "confidence_sessions",
};

export const storage = {
  // User data
  saveUser: (user: UserData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  getUser: (): UserData | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  clearUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Sessions
  saveSessions: (sessions: Session[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  },

  getSessions: (): Session[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  clearSessions: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    }
  },

  // Clear all data
  clearAll: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    }
  },
};
