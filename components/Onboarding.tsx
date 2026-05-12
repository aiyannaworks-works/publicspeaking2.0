"use client";

import { useState, useRef } from "react";
import { UserData } from "@/lib/types";
import { analyzeSpeech } from "@/lib/utils";
import { Btn, RecordButton, TimerDisplay } from "./ui";

const purple = "#667eea";

export default function Onboarding({
  onComplete,
}: {
  onComplete: (u: UserData) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", goal: "", experience: "" });
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleRec = () => {
    if (!recording) {
      setRecording(true);
      setTime(0);
      timer.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(timer.current!);
      setRecording(false);
      setDone(true);
    }
  };

  const finish = () =>
    onComplete({
      ...form,
      baseline: analyzeSpeech(time),
      xp: 0,
      level: 1,
      streak: 0,
      dailyGoalXp: 50,
      todayXp: 0,
      lastActiveDate: new Date().toDateString(),
      language: "en",
      friends: [
        { id: "1", name: "Duo", xp: 1250, level: 12, streak: 45 },
        { id: "2", name: "Lily", xp: 840, level: 8, streak: 12 },
        { id: "3", name: "Zari", xp: 2100, level: 21, streak: 102 }
      ],
    });

  if (step === 1)
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", animation: "slideInUp 0.5s ease-out" }}>
        <div style={{ fontSize: 80, marginBottom: 24, animation: "bounce 1s ease-in-out infinite" }}>🎯</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: "#2a2a2a", marginBottom: 12, letterSpacing: "-1px", fontFamily: "'Syne', sans-serif" }}>
          Master Public Speaking
        </h1>
        <p
          style={{
            color: "#d97e3a",
            fontSize: 20,
            lineHeight: 1.6,
            maxWidth: 540,
            margin: "0 auto 32px",
            fontWeight: 700,
          }}
        >
          Gamified. Competitive. Effective.
        </p>
        <p
          style={{
            color: "#666",
            fontSize: 16,
            lineHeight: 1.8,
            maxWidth: 540,
            margin: "0 auto 40px",
            fontWeight: 400,
          }}
        >
          Earn XP, compete with friends, and transform your speaking skills through interactive practice.
        </p>
        <Btn onClick={() => setStep(2)}>Get Started →</Btn>
      </div>
    );

  if (step === 2)
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
          Tell us about yourself
        </h2>

        <Field label="What's your name?">
          <input
            style={inputStyle}
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>

        <Field label="Primary goal?">
          <select
            style={inputStyle}
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
          >
            <option value="">Select a goal</option>
            <option value="confidence">Build Speaking Confidence</option>
            <option value="presentations">Improve Presentations</option>
            <option value="interviews">Ace Interviews</option>
            <option value="everyday">Everyday Communication</option>
          </select>
        </Field>

        <Field label="Current experience level?">
          <select
            style={inputStyle}
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          >
            <option value="">Select level</option>
            <option value="beginner">Beginner – Just starting out</option>
            <option value="intermediate">Intermediate – Some experience</option>
            <option value="advanced">Advanced – Experienced speaker</option>
          </select>
        </Field>

        <Btn
          disabled={!form.name || !form.goal || !form.experience}
          onClick={() => setStep(3)}
        >
          Continue →
        </Btn>
      </div>
    );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        Baseline Recording
      </h2>
      <p style={{ color: "#666", marginBottom: 24, lineHeight: 1.6 }}>
        Talk about your favourite hobby for 30–60 seconds so we can capture
        your baseline speaking patterns.
      </p>
      <div
        style={{
          textAlign: "center",
          padding: 36,
          background: "#f8f9fa",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <RecordButton recording={recording} onClick={toggleRec} />
        {recording && <TimerDisplay seconds={time} />}
        {done && (
          <p style={{ marginTop: 16, color: "#10b981", fontWeight: 600 }}>
            ✓ Recording complete! Analysing…
          </p>
        )}
      </div>
      {done && <Btn onClick={finish}>Complete Setup</Btn>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28, animation: "slideInUp 0.4s ease-out" }}>
      <label style={{ display: "block", fontWeight: 700, marginBottom: 10, color: "#2a2a2a", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  border: "2px solid #e0e0e0",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 500,
  transition: "all 0.2s",
  outline: "none",
  backgroundColor: "#fafaf8",
};
