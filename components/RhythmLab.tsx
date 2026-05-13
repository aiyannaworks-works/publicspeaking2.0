"use client";

import { useState, useRef } from "react";
import { Session } from "@/lib/types";
import { DRILLS, analyzeSpeech } from "@/lib/utils";
import { Btn, Badge, FeedbackRow, RecordButton, TimerDisplay } from "./ui";

const orange = "#d97e3a";

export default function RhythmLab({
  addSession,
}: {
  addSession: (s: Omit<Session, "id">) => void;
}) {
  const [drill, setDrill] = useState<(typeof DRILLS)[0] | null>(null);
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof analyzeSpeech> | null>(
    null
  );
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => {
    if (!recording) {
      setRecording(true);
      setTime(0);
      setResult(null);
      timer.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(timer.current!);
      setRecording(false);
      const a = analyzeSpeech(time);
      setResult(a);
      addSession({
        type: "rhythm-lab",
        drill: drill!.id,
        drillName: drill!.name,
        analysis: a,
        date: new Date().toISOString(),
      });
    }
  };

  const back = () => {
    clearInterval(timer.current!);
    setDrill(null);
    setResult(null);
    setTime(0);
    setRecording(false);
  };

  /* ── Drill list ── */
  if (!drill)
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          Rhythm Lab
        </h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Build your speaking foundation with targeted drills focused on pace,
          pauses, and timing.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 16,
          }}
        >
          {DRILLS.map((d) => (
            <DrillCard key={d.id} drill={d} onClick={() => setDrill(d)} />
          ))}
        </div>
      </div>
    );

  /* ── Results ── */
  if (result)
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: orange, marginBottom: 20 }}>
          Practice Complete! 🎉
        </h1>
        <div
          style={{
            background: "#fff9f0",
            borderLeft: "4px solid #d97e3a",
            padding: 20,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <h4 style={{ color: orange, marginBottom: 10 }}>
            Performance Analysis
          </h4>
          <FeedbackRow
            label="Confidence Score"
            value={`${result.confidenceScore}/100`}
            color="success"
          />
          <FeedbackRow label="Speaking Pace" value={`${result.pace} WPM`} color="info" />
          <FeedbackRow
            label="Filler Words"
            value={`${result.fillerWords} detected`}
            color={result.fillerWords < 5 ? "success" : "warning"}
          />
          <FeedbackRow label="Avg Pause" value={`${result.avgPause}s`} color="info" />
          <FeedbackRow
            label="Duration"
            value={`${Math.floor(result.duration / 60)}:${String(
              result.duration % 60
            ).padStart(2, "0")}`}
            color="info"
          />
        </div>
        <div
          style={{
            background: "#fff9f0",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h4 style={{ color: orange, marginBottom: 10 }}>💡 Personalised Tips</h4>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
            {result.pace < 130 && (
              <li>Try speaking slightly faster – aim for 130–150 WPM</li>
            )}
            {result.pace > 160 && (
              <li>Slow down a bit – aim for 130–150 WPM</li>
            )}
            {result.fillerWords > 8 && (
              <li>Practise eliminating filler words like &quot;um&quot;, &quot;uh&quot;, and &quot;like&quot;</li>
            )}
            {parseFloat(result.avgPause) < 0.5 && (
              <li>Add more strategic pauses to let your ideas breathe</li>
            )}
            <li>Great job! Keep practising daily for best results</li>
          </ul>
        </div>
        <Btn onClick={back}>Back to Drills</Btn>
      </div>
    );

  /* ── Active drill ── */
  return (
    <div>
      <Btn variant="secondary" onClick={back}>
        ← Back
      </Btn>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "12px 0 8px" }}>
        {drill.name}
      </h1>
      <p style={{ color: "#666", marginBottom: 20 }}>{drill.description}</p>
      <div
        style={{
          background: "#f8f9fa",
          padding: 24,
          borderRadius: 12,
          marginBottom: 20,
          borderLeft: `4px solid ${orange}`,
        }}
      >
        <div style={{ color: orange, fontWeight: 600, marginBottom: 10 }}>
          Your Prompt:
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.8 }}>{drill.prompt}</div>
      </div>
      <div
        style={{
          textAlign: "center",
          padding: 36,
          background: "#f8f9fa",
          borderRadius: 12,
        }}
      >
        <RecordButton recording={recording} onClick={toggle} />
        {recording && <TimerDisplay seconds={time} />}
        <p style={{ color: "#666", marginTop: 16 }}>
          {recording
            ? "Recording… click Stop when finished"
            : "Click the mic to begin"}
        </p>
      </div>
    </div>
  );
}

function DrillCard({
  drill,
  onClick,
}: {
  drill: (typeof DRILLS)[0];
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(135deg,#d97e3a,#c96f2e)",
        color: "#fff",
        padding: 28,
        borderRadius: 12,
        cursor: "pointer",
        position: "relative",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 8px 20px rgba(0,0,0,.2)" : "none",
        transition: "transform .2s, box-shadow .2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          background: "rgba(255,255,255,.25)",
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 12,
        }}
      >
        {drill.badge}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        {drill.name}
      </div>
      <div style={{ fontSize: 14, opacity: 0.9 }}>{drill.description}</div>
    </div>
  );
}
