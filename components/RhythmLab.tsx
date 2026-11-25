"use client";
import { useEffect, useRef, useState } from 'react';
import { Session } from '@/lib/types';
import { DRILLS } from '@/lib/utils';
import { AudioRecorder, RecordingResult } from '@/lib/audio-recorder';
import { Btn, Badge, FeedbackRow, TimerDisplay, T } from './ui';

type SaveSession = (session: Omit<Session, 'id'>) => void;

export function SpeechExercise({ title, prompt, type, drill, maxSeconds = 90, addSession, onBack }: {
  title: string; prompt: string; type: 'rhythm-lab' | 'one-minute-pitch'; drill?: string;
  maxSeconds?: number; addSession: SaveSession; onBack: () => void;
}) {
  const [phase, setPhase] = useState<'ready' | 'starting' | 'recording' | 'saving' | 'done'>('ready');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [url, setUrl] = useState('');
  const [transcribe, setTranscribe] = useState(false);
  const recorder = useRef<AudioRecorder | null>(null);
  const mounted = useRef(true);
  const stopping = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; recorder.current?.cancel(); }; }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const stop = async () => {
    if (stopping.current || !recorder.current) return;
    stopping.current = true; setPhase('saving');
    try {
      const captured = await recorder.current.stopRecording();
      if (!mounted.current) return;
      setResult(captured); setUrl(URL.createObjectURL(captured.blob));
      setSeconds(Math.round(captured.duration)); setPhase('done');
      if (captured.duration >= 3) addSession({ type, drill, drillName: title, topic: type === 'one-minute-pitch' ? prompt : undefined,
        transcript: captured.transcript, duration: captured.duration, analysis: captured.analysis, date: new Date().toISOString() });
      else setError('Recording was shorter than 3 seconds. Try again to save a practice session.');
    } catch (e) { if (mounted.current) { setError(e instanceof Error ? e.message : 'Could not finish recording.'); setPhase('ready'); } }
    finally { stopping.current = false; }
  };
  useEffect(() => {
    if (phase !== 'recording') return;
    const started = performance.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((performance.now() - started) / 1000); setSeconds(elapsed);
      if (elapsed >= maxSeconds) void stop();
    }, 200);
    return () => clearInterval(timer);
  }, [phase, maxSeconds]); // stop reads the current recorder through its ref

  const start = async () => {
    setError(''); setResult(null); setUrl(''); setSeconds(0); setPhase('starting');
    const next = new AudioRecorder(); recorder.current = next;
    try { await next.startRecording(transcribe); if (mounted.current) setPhase('recording'); else next.cancel(); }
    catch (e) { if (mounted.current) { setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow microphone access in your browser settings, then try again.' : e instanceof Error ? e.message : 'Could not open the microphone.'); setPhase('ready'); } }
  };
  return <div>
    <Btn variant="secondary" onClick={() => { recorder.current?.cancel(); onBack(); }}>← Back</Btn>
    <h1 style={{ fontSize: 26, marginTop: 16 }}>{title}</h1>
    <div className="card" style={{ marginBottom: 24 }}><p>{prompt}</p></div>
    {error && <p role="alert" style={{ color: '#b3261e', marginBottom: 16 }}>{error}</p>}
    {phase === 'ready' && <div>
      <p style={{ marginBottom: 16 }}>Record up to {maxSeconds} seconds, then listen back. Audio stays on this device and is not uploaded.</p>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
        <input type="checkbox" checked={transcribe} onChange={e => setTranscribe(e.target.checked)} />
        <span>Enable English live transcription and feedback. Your browser may send speech to its transcription service. Transcript and metrics are saved with your session.</span>
      </label>
    </div>}
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      {phase === 'recording' ? <><Btn variant="danger" onClick={() => void stop()}>Stop recording</Btn><TimerDisplay seconds={seconds} /><p>Microphone recording • maximum {maxSeconds}s</p></> :
       phase === 'starting' || phase === 'saving' ? <p role="status">{phase === 'starting' ? 'Opening microphone…' : 'Finishing recording…'}</p> :
       <Btn onClick={() => void start()}>{phase === 'done' ? 'Record again' : 'Start recording'}</Btn>}
    </div>
    {result && <section>
      <h2>Your recording</h2><audio controls src={url} style={{ width: '100%', marginBottom: 16 }} />
      <p>Duration: {result.duration.toFixed(1)} seconds</p>
      {result.notice && <p role="status">{result.notice}</p>}
      {result.transcript && <><h3 style={{ marginTop: 20 }}>Transcript</h3><p style={{ whiteSpace: 'pre-wrap' }}>{result.transcript}</p></>}
      {result.analysis && <div style={{ marginTop: 20 }}>
        <h3>Practice feedback</h3><p>Estimates from the recognized words and recording duration. Recognition can miss fillers. Practice score reflects pace and filler frequency; it does not measure confidence.</p>
        <FeedbackRow label="Practice score" value={`${result.analysis.confidenceScore}/100`} color="success" />
        <FeedbackRow label="Estimated pace" value={`${result.analysis.pace} WPM`} />
        <FeedbackRow label="Fillers in transcript" value={String(result.analysis.fillerWords)} />
        {result.analysis.avgPause !== '' && <FeedbackRow label="Average detected silence" value={`${result.analysis.avgPause}s`} />}
        <p style={{ marginTop: 16 }}>{result.analysis.pace > 160 ? 'Try a slower pace and give key ideas room to land.' : result.analysis.pace < 110 ? 'Try delivering your next idea at a steadier pace.' : 'Your estimated pace is in a comfortable range. Keep practising.'}</p>
      </div>}
    </section>}
  </div>;
}

export default function RhythmLab({ addSession }: { addSession: SaveSession }) {
  const [drill, setDrill] = useState<(typeof DRILLS)[number] | null>(null);
  if (drill) return <SpeechExercise key={drill.id} title={drill.name} prompt={drill.prompt} type="rhythm-lab" drill={drill.id} addSession={addSession} onBack={() => setDrill(null)} />;
  return <div className="practice-page">
    <div className="practice-intro"><h1>Rhythm Lab</h1><p>Build your speaking foundation with targeted drills focused on pace, pauses, and timing.</p></div>
    <div className="practice-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
      {DRILLS.map(d => <button key={d.id} type="button" className="practice-choice-card" onClick={() => setDrill(d)} aria-label={`Start ${d.name}`}
        style={{ width: '100%', background: T.white, color: T.ink, padding: 26, border: `2px solid ${T.border}`, borderRadius: 16, textAlign: 'left', whiteSpace: 'normal' }}>
        <div style={{ marginBottom: 14 }}><Badge>{d.badge}</Badge></div>
        <h3>{d.name}</h3><p>{d.description}</p>
        <div className="practice-card-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 18, color: T.orangeDark }}><span>Up to 90s • +50 XP</span><span>Start →</span></div>
      </button>)}
    </div>
  </div>;
}
