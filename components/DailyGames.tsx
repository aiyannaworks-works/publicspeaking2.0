"use client";

import { useState, useRef, useEffect } from "react";
import { Session } from "@/lib/types";
import { PITCH_TOPICS, WORD_BANK, analyzeSpeech } from "@/lib/utils";
import { Btn, RecordButton, TimerDisplay } from "./ui";

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
    setPhase("playing");
    setWordsCount(0);
    setTimeLeft(60);
    setWord(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
    timer.current = setInterval(
      () =>
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer.current!);
            setPhase("done");
            return 0;
          }
          return t - 1;
        }),
      1000
    );
  };

  const nextWord = () => {
    setWordsCount((w) => w + 1);
    setWord(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
  };

  useEffect(() => {
    if (phase === "done" && game === "sprint") {
      addSession({
        type: "word-sprint",
        wordsTyped: wordsCount,
        analysis: { confidenceScore: Math.min(100, wordsCount * 2), duration: 60, fillerWords: 0, fillerRate: "0", avgPause: "0", pace: 0 },
        date: new Date().toISOString(),
      });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pitch ── */
  const startPitch = () => {
    setTopic(PITCH_TOPICS[Math.floor(Math.random() * PITCH_TOPICS.length)]);
    setPhase("ready");
  };

  const togglePitch = () => {
    if (phase === "ready") {
      setPhase("recording");
      setRecTime(0);
      timer.current = setInterval(
        () =>
          setRecTime((t) => {
            if (t >= 60) {
              clearInterval(timer.current!);
              endPitch(60);
              return 60;
            }
            return t + 1;
          }),
        1000
      );
    } else {
      clearInterval(timer.current!);
      endPitch(recTime);
    }
  };

  const endPitch = (duration: number) => {
    setPhase("complete");
    addSession({
      type: "one-minute-pitch",
      topic,
      analysis: analyzeSpeech(duration),
      date: new Date().toISOString(),
    });
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
            Say as many words as you can in 60 seconds. This builds mental
            agility for speaking.
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
              fontSize: 48,
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
          You said {wordsCount} words!
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

  /* ── Pitch screens ── */
  if (phase === "ready")
    return (
      <div>
        <Btn variant="secondary" onClick={reset}>
          ← Back
        </Btn>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "12px 0 16px" }}>
          🎤 One-Minute Pitch
        </h1>
        <div
          style={{
            background: "#f8f9fa",
            padding: 24,
            borderRadius: 12,
            marginBottom: 20,
            borderLeft: `4px solid ${orange}`,
          }}
        >
          <div style={{ color: orange, fontWeight: 600, marginBottom: 8 }}>
            Your Topic:
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{topic}</div>
        </div>
        <p style={{ color: "#666", marginBottom: 24 }}>
          You have 60 seconds to deliver a compelling pitch. Click Start when
          ready!
        </p>
        <div style={{ textAlign: "center" }}>
          <Btn onClick={togglePitch}>Start Recording</Btn>
        </div>
      </div>
    );

  if (phase === "recording")
    return (
      <div
        style={{
          textAlign: "center",
          padding: 36,
          background: "#f8f9fa",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: orange,
            marginBottom: 20,
          }}
        >
          {60 - recTime}s
        </div>
        <RecordButton recording={true} onClick={togglePitch} />
        <TimerDisplay seconds={recTime} />
      </div>
    );

  // complete
  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ color: orange, marginBottom: 16 }}>Pitch Complete! 🎉</h1>
      <div
        style={{
          padding: 24,
          background: "#fff9f0",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 17, marginBottom: 8 }}>
          Great job delivering your pitch on: <strong>{topic}</strong>
        </p>
        <p style={{ color: "#666" }}>
          Your session has been saved to your progress dashboard!
        </p>
      </div>
      <Btn onClick={reset}>Back to Games</Btn>
      <Btn variant="secondary" onClick={startPitch}>
        Try Another Topic
      </Btn>
    </div>
  );
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
