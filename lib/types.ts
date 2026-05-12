export interface SpeechAnalysis {
  confidenceScore: number;
  duration: number;
  fillerWords: number;
  fillerRate: string;
  avgPause: string;
  pace: number;
}

export interface Session {
  id: number;
  type: "rhythm-lab" | "word-sprint" | "one-minute-pitch";
  date: string;
  drill?: string;
  drillName?: string;
  topic?: string;
  wordsTyped?: number;
  analysis?: SpeechAnalysis;
}

export interface UserData {
  name: string;
  goal: string;
  experience: string;
  baseline: SpeechAnalysis;
  xp: number;
  level: number;
  streak: number;
  dailyGoalXp: number;
  todayXp: number;
  lastActiveDate: string;
  language: "en" | "es" | "fr" | "de";
  friends: Friend[];
}

export interface Friend {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}
