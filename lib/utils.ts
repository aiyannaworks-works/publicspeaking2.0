import { SpeechAnalysis } from "./types";

export function analyzeSpeech(durationSeconds: number): SpeechAnalysis {
  const duration = durationSeconds || 30;
  const pace = Math.floor(Math.random() * 60) + 110; // 110–170 WPM
  const fillerWords = Math.floor(Math.random() * 12);
  const fillerRate = ((fillerWords / (duration / 60)) * 1).toFixed(2);
  const avgPause = (Math.random() * 1.5 + 0.3).toFixed(1);
  const confidenceScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        70 +
          (pace >= 130 && pace <= 160 ? 10 : -5) +
          (fillerWords < 5 ? 10 : fillerWords < 10 ? 0 : -10) +
          Math.floor(Math.random() * 10)
      )
    )
  );
  return { confidenceScore, duration, fillerWords, fillerRate, avgPause, pace };
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
