"use client";

import { useState, useRef, useEffect } from "react";
import { Session } from "@/lib/types";
import { PITCH_TOPICS, WORD_BANK } from "@/lib/utils";
import { Btn } from "./ui";
import { SpeechExercise } from "./RhythmLab";

const orange = "#d97e3a";
const green = "#6ba045";

type Game = "sprint" | "pitch" | null;
type Phase =
  | "idle"
  | "playing"
  | "done"
  | "ready"
  | "recording"
  | "complete";

export default function DailyGames({
  addSession,
}: {
  addSession: (s: Omit<Session, "id">) => void;
}) {
  const [game, setGame] = useState<Game>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [word, setWord] = useState("");
  const [wordsCount, setWordsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [recTime, setRecTime] = useState(0);
  const [topic, setTopic] = useState("");
  const sprintSaved = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    clearInterval(timer.current!);
    setGame(null);
    setPhase("idle");
    setWordsCount(0);
    setTimeLeft(60);
    setRecTime(0);
  };

  /* ── Word Sprint ── */
  const startSprint = () => {
    sprintSaved.current = false;
    setPhase("playing");
    setWordsCount(0);
    setTimeLeft(60);
    setWord(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
    if (timer.current) clearInterval(timer.current);
    const deadline = Date.now() + 60000;
    timer.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (!remaining) { clearInterval(timer.current!); setPhase("done"); }
    }, 200);
  };

  const nextWord = () => {
    setWordsCount((w) => w + 1);
    setWord(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
  };

  useEffect(() => {
    if (phase === "done" && game === "sprint" && !sprintSaved.current) {
      sprintSaved.current = true;
      addSession({
        type: "word-sprint",
        wordsTyped: wordsCount,
        duration: 60,
        date: new Date().toISOString(),
      });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startPitch = () => {
    setTopic(PITCH_TOPICS[Math.floor(Math.random() * PITCH_TOPICS.length)]);
    setPhase("ready");
  };

  /* ── Game list ── */
  if (!game)
    return (
      <div className="practice-page">
        <div className="practice-intro">
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>
          Daily Games
        </h1>
        <p style={{ color: "#666" }}>
          Challenge yourself with fun games designed to improve your speaking
          skills.
        </p>
        </div>
        <div
          className="practice-grid games-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 20,
          }}
        >
          <GameCard
            title="⚡ Word Sprint"
            description="Say as many words as you can in 60 seconds. Build vocabulary recall speed!"
            onClick={() => {
              setGame("sprint");
              setPhase("idle");
            }}
          />
          <GameCard
            title="🎤 One-Minute Pitch"
            description="Get a random topic and deliver a compelling one-minute pitch. Great for interviews!"
            onClick={() => {
              setGame("pitch");
              startPitch();
            }}
          />
        </div>
      </div>
    );

  /* ── Word Sprint screens ── */
  if (game === "sprint") {
    if (phase === "idle")
      return (
        <div>
          <Btn variant="secondary" onClick={reset}>
            ← Back
          </Btn>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "12px 0 12px" }}>
            ⚡ Word Sprint
          </h1>
          <p style={{ color: "#666", marginBottom: 28 }}>
            Say each displayed word aloud, then tap Got it to count it. This is a self-counted vocabulary drill; it does not use your microphone.
          </p>
          <div style={{ textAlign: "center" }}>
            <Btn onClick={startSprint}>Start Game</Btn>
          </div>
        </div>
      );

    if (phase === "playing")
      return (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: orange,
              marginBottom: 8,
            }}
          >
            {timeLeft}s
          </div>
          <div
            style={{
              fontSize: "clamp(24px, 7vw, 48px)",
              overflowWrap: "anywhere",
              fontWeight: 700,
              padding: 36,
              color: orange,
              minHeight: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {word}
          </div>
          <Btn
            onClick={nextWord}
            style={{ fontSize: 18, padding: "16px 48px" }}
          >
            ✓ Got it!
          </Btn>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: green,
              margin: "16px 0",
            }}
          >
            Words: {wordsCount}
          </div>
        </div>
      );

    // done
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: orange, marginBottom: 16 }}>Game Complete! 🎉</h1>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: green,
            margin: "16px 0",
          }}
        >
          You marked {wordsCount} words complete!
        </div>
        <div
          style={{
            padding: 24,
            background: "#fff9f0",
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 17,
          }}
        >
          {wordsCount >= 30
            ? "Excellent speed! 🚀"
            : wordsCount >= 20
            ? "Great job! Keep practising! 💪"
            : "Good start! Play daily to improve! 🌟"}
        </div>
        <Btn onClick={reset}>Back to Games</Btn>
        <Btn variant="secondary" onClick={startSprint}>
          Play Again
        </Btn>
      </div>
    );
  }

  return <SpeechExercise title="One-Minute Pitch" prompt={topic} type="one-minute-pitch" maxSeconds={60} addSession={addSession} onBack={reset} />;
}

function GameCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="practice-choice-card"
      onClick={onClick}
      aria-label={`Start ${title}`}
      style={{
        width: "100%",
        background: "#fff",
        border: "2px solid #e8e4de",
        borderRadius: 16,
        padding: 26,
        cursor: "pointer",
        textAlign: "left",
        whiteSpace: "normal",
      }}
    >
      <h3 style={{ color: orange, marginBottom: 8, fontSize: 18 }}>{title}</h3>
      <p style={{ color: "#666", lineHeight: 1.6, marginBottom: 14 }}>
        {description}
      </p>
      <div
        className="practice-card-footer"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          fontWeight: 700,
          color: orange,
          fontSize: 13,
        }}
      >
        <span>About 1 min • +50 XP</span>
        <span>Start →</span>
      </div>
    </button>
  );
}
