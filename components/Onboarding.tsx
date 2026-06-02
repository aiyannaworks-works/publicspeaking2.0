"use client";

import { useState, useRef } from "react";
import { UserData } from "@/lib/types";
import { Language } from "@/lib/translations";
import { analyzeSpeech } from "@/lib/utils";
import { Btn, RecordButton, TimerDisplay, T } from "./ui";

export default function Onboarding({
  onComplete,
  language = "en",
  t = (key: string) => key,
}: {
  onComplete: (u: UserData) => void;
  language?: Language;
  t?: (key: string) => string;
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
      timer.current = setInterval(() => setTime((tt) => tt + 1), 1000);
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
      language,
      friends: [
        { id: "1", name: "Duo",  xp: 1250, level: 12, streak: 45 },
        { id: "2", name: "Lily", xp: 840,  level: 8,  streak: 12 },
        { id: "3", name: "Zari", xp: 2100, level: 21, streak: 102 },
      ],
    });

  /* ── Step 1: Welcome ── */
  if (step === 1)
    return (
      <div style={s.welcome}>
        {/* Brand mark */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>🎙</div>
          <span style={s.wordmark}>Articulate</span>
        </div>

        <h1 style={s.headline}>Speak with confidence,<br />every single day.</h1>
        <p style={s.body}>
          Earn XP, compete with friends, and transform your speaking skills
          through personalised daily practice.
        </p>

        {/* Feature grid */}
        <div style={s.featureGrid}>
          {[
            { icon: "🎯", label: "Targeted drills" },
            { icon: "📈", label: "Track progress" },
            { icon: "🔥", label: "Daily streaks" },
            { icon: "🏆", label: "Leaderboards" },
          ].map(({ icon, label }) => (
            <div key={label} style={s.featureChip}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={s.featureLabel}>{label}</span>
            </div>
          ))}
        </div>

        <Btn onClick={() => setStep(2)} style={{ marginTop: 8 }}>
          Get started →
        </Btn>
      </div>
    );

  /* ── Step 2: Profile ── */
  if (step === 2)
    return (
      <div style={s.stepWrap}>
        <StepIndicator current={2} total={3} />
        <h2 style={s.stepTitle}>Tell us about yourself</h2>
        <p style={s.stepSub}>We'll personalise your experience based on your answers.</p>

        <div style={s.fieldList}>
          <Field label="What's your name?">
            <input
              style={s.input}
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Primary goal">
            <select
              style={s.input}
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

          <Field label="Experience level">
            <select
              style={s.input}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner — Just starting out</option>
              <option value="intermediate">Intermediate — Some experience</option>
              <option value="advanced">Advanced — Experienced speaker</option>
            </select>
          </Field>
        </div>

        <Btn
          disabled={!form.name || !form.goal || !form.experience}
          onClick={() => setStep(3)}
          fullWidth
        >
          Continue →
        </Btn>
      </div>
    );

  /* ── Step 3: Baseline recording ── */
  return (
    <div style={s.stepWrap}>
      <StepIndicator current={3} total={3} />
      <h2 style={s.stepTitle}>Baseline recording</h2>
      <p style={s.stepSub}>
        Talk about your favourite hobby for 30–60 seconds. This helps us
        calibrate your starting point.
      </p>

      <div style={s.recorderCard}>
        <RecordButton recording={recording} onClick={toggleRec} />
        {recording && <TimerDisplay seconds={time} />}
        {!recording && !done && (
          <p style={{ fontSize: 13, color: T.ink4, marginTop: 16 }}>
            Tap the mic to begin
          </p>
        )}
        {done && (
          <div style={s.doneChip}>
            <span>✓</span>
            <span>Recording complete — analysing…</span>
          </div>
        )}
      </div>

      {done && (
        <Btn onClick={finish} fullWidth variant="success">
          Complete setup →
        </Btn>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 9999,
            background: i < current ? T.orange : T.border,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: T.ink2, letterSpacing: "0.02em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  welcome: {
    textAlign: "center",
    padding: "32px 16px 24px",
    maxWidth: 520,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    animation: "slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: T.orange,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    boxShadow: "0 4px 12px rgba(232,115,42,0.35)",
  },
  wordmark: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    color: T.ink,
    letterSpacing: "-0.04em",
  },
  headline: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: "clamp(24px, 5vw, 36px)",
    fontWeight: 800,
    color: T.ink,
    letterSpacing: "-0.04em",
    lineHeight: 1.2,
    margin: 0,
  },
  body: {
    fontSize: 15,
    color: T.ink3,
    lineHeight: 1.65,
    maxWidth: 420,
    margin: 0,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    width: "100%",
    maxWidth: 340,
  },
  featureChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: T.surface,
    border: `1.5px solid ${T.border}`,
    borderRadius: 12,
    padding: "10px 14px",
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: T.ink2,
  },
  stepWrap: {
    maxWidth: 520,
    margin: "0 auto",
    animation: "slideUp 0.35s cubic-bezier(0.4,0,0.2,1) both",
  },
  stepTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: T.ink,
    letterSpacing: "-0.03em",
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 14,
    color: T.ink3,
    lineHeight: 1.6,
    marginBottom: 28,
  },
  fieldList: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginBottom: 28,
  },
  input: {
    padding: "13px 16px",
    border: `1.5px solid ${T.border}`,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 500,
    color: T.ink,
    background: T.white,
    outline: "none",
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
  },
  recorderCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 24px",
    background: T.surface,
    borderRadius: 20,
    border: `1.5px solid ${T.border}`,
    marginBottom: 24,
    gap: 8,
  },
  doneChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: T.greenLight,
    color: T.greenDark,
    padding: "10px 18px",
    borderRadius: 9999,
    fontSize: 13,
    fontWeight: 700,
    marginTop: 8,
  },
};
