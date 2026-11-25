import { SpeechAnalysis } from "./types";

export function analyzeSpeech(durationSeconds: number, transcript = "", pauses: number[] = [], measuredPauses = false): SpeechAnalysis {
  const duration = Math.max(0.1, durationSeconds);
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const pace = Math.round(words / duration * 60);
  const fillerWords = (transcript.match(/\b(um|uh|erm|you know|basically|actually|literally|like)\b/gi) || []).length;
  const fillerRate = (fillerWords / (duration / 60)).toFixed(2);
  const avgPause = measuredPauses ? (pauses.length ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0).toFixed(1) : "";
  const confidenceScore = words ? Math.max(0, Math.round(100 - Math.max(0, 110 - pace) / 2 - Math.max(0, pace - 160) / 2 - fillerWords / words * 200)) : 0;
  return { measured: words > 0, confidenceScore, duration, fillerWords, fillerRate, avgPause, pace };
}

export const DRILLS = [
  {
    id: "pace",
    name: "Pace Control",
    badge: "Beginner",
    description: "Master the art of speaking at the perfect speed.",
    prompt:
      "Describe your morning routine in detail, focusing on speaking at a steady, comfortable pace. Aim for 130–150 words per minute.",
  },
  {
    id: "pauses",
    name: "Power Pauses",
    badge: "Intermediate",
    description: "Use strategic silence to emphasise key points.",
    prompt:
      "Talk about a challenge you overcame. After each key point, pause for 1–2 seconds before continuing.",
  },
  {
    id: "clarity",
    name: "Crystal Clarity",
    badge: "Beginner",
    description: "Articulate every word with precision and confidence.",
    prompt:
      "Read this tongue-twister slowly and clearly: 'She sells sea shells by the sea shore.' Then describe your favourite place in vivid detail.",
  },
  {
    id: "storytelling",
    name: "Story Structure",
    badge: "Advanced",
    description: "Craft compelling narratives with a clear arc.",
    prompt:
      "Tell a 60-second story with a clear beginning, middle, and end. Use the structure: situation → conflict → resolution.",
  },
];

export const WORD_BANK = [
  "Innovation", "Resilience", "Collaborate", "Empower", "Strategy",
  "Momentum", "Clarity", "Vision", "Transform", "Inspire",
  "Leadership", "Growth", "Impact", "Solution", "Excellence",
  "Creativity", "Passion", "Focus", "Achieve", "Breakthrough",
  "Confidence", "Authentic", "Dynamic", "Engage", "Motivate",
];

export const PITCH_TOPICS = [
  "Why remote work is the future of business",
  "How AI will change education in the next decade",
  "The importance of mental health in the workplace",
  "Why every company should invest in sustainability",
  "How social media has changed human connection",
  "The case for a four-day work week",
  "Why lifelong learning is the key to success",
  "How cities can become more liveable",
];
