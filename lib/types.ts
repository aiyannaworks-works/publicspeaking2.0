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
}
