import { SpeechAnalysis } from './types';
import { analyzeSpeech } from './utils';

export interface RecordingResult { blob: Blob; duration: number; transcript: string; analysis?: SpeechAnalysis; notice: string; }

// Recognition is optional; audio recording/playback works without it.
export class AudioRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private recognition: any = null;
  private context: AudioContext | null = null;
  private sampleTimer: ReturnType<typeof setInterval> | null = null;
  private started = 0;
  private active = false;
  private cancelled = false;
  private transcript = '';
  private notice = '';
  private silentSince: number | null = null;
  private heardVoice = false;
  private pauses: number[] = [];
  private recognitionEnded: Promise<void> = Promise.resolve();
  private endRecognition: () => void = () => {};

  async startRecording(transcribe = false): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new Error('Recording is unavailable in this browser. Try Safari or Chrome over HTTPS.');
    }
    this.cancelled = false;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (this.cancelled) { this.release(); throw new Error('Recording cancelled.'); }
    try {
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(t => MediaRecorder.isTypeSupported(t));
      this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
      this.chunks = []; this.transcript = ''; this.pauses = []; this.heardVoice = false; this.silentSince = null;
      this.notice = transcribe ? '' : 'Transcription is off. Your recording is available for playback.';
      this.recorder.ondataavailable = e => { if (e.data.size) this.chunks.push(e.data); };
      this.recorder.start(250);
      this.started = performance.now(); this.active = true;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.context = new AudioContextClass();
        await this.context!.resume();
        const analyser = this.context!.createAnalyser(); analyser.fftSize = 2048;
        this.context!.createMediaStreamSource(this.stream).connect(analyser);
        const values = new Float32Array(analyser.fftSize);
        this.sampleTimer = setInterval(() => {
          analyser.getFloatTimeDomainData(values);
          const rms = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
          const now = performance.now();
          if (rms > 0.018) {
            if (this.heardVoice && this.silentSince !== null && now - this.silentSince >= 500) this.pauses.push((now - this.silentSince) / 1000);
            this.heardVoice = true; this.silentSince = null;
          } else if (this.heardVoice && this.silentSince === null) this.silentSince = now;
        }, 100);
      } catch { this.context?.close().catch(() => {}); this.context = null; }
      if (transcribe) this.startRecognition();
    } catch (error) { this.cancel(); throw error; }
  }

  private startRecognition() {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) { this.notice = 'Live transcription is unavailable here. You can still record and listen back.'; return; }
    const recognition = new Recognition(); this.recognition = recognition;
    recognition.lang = 'en-US'; recognition.continuous = true; recognition.interimResults = false;
    this.recognitionEnded = new Promise(resolve => { this.endRecognition = resolve; });
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) this.transcript += ' ' + event.results[i][0].transcript;
      }
    };
    recognition.onerror = () => { this.notice = 'Transcription was interrupted. Any transcript and its metrics may be incomplete.'; };
    recognition.onend = () => {
      if (this.active) {
        try { recognition.start(); } catch { this.notice = 'Transcription ended early. Metrics may be incomplete.'; this.endRecognition(); }
      } else this.endRecognition();
    };
    try { recognition.start(); } catch { this.notice = 'Transcription could not start. Your audio is still being recorded.'; this.endRecognition(); }
  }

  async stopRecording(): Promise<RecordingResult> {
    if (!this.recorder || this.recorder.state !== 'recording') throw new Error('No recording in progress.');
    this.active = false;
    const duration = Math.max(0.1, (performance.now() - this.started) / 1000);
    const recorder = this.recorder;
    try {
      const audio = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(this.chunks, { type: recorder.mimeType }));
        recorder.onerror = () => reject(new Error('The browser could not finish the recording. Please try again.'));
      });
      this.recognition?.stop(); recorder.stop();
      const blob = await audio;
      if (this.recognition) await Promise.race([this.recognitionEnded, new Promise(resolve => setTimeout(resolve, 1800))]);
      if (!blob.size) throw new Error('No audio was captured. Check your microphone and try again.');
      const transcript = this.transcript.trim();
      const analysis = transcript && !this.notice ? analyzeSpeech(duration, transcript, this.pauses, !!this.context) : undefined;
      return { blob, duration, transcript, analysis, notice: this.notice || (!transcript ? 'No transcript was captured. Listen to your recording; no speech score was generated.' : '') };
    } finally { this.release(); }
  }

  cancel() { this.cancelled = true; this.active = false; this.release(); }
  private release() {
    if (this.sampleTimer) clearInterval(this.sampleTimer);
    this.sampleTimer = null;
    if (this.recognition) { this.recognition.onend = null; try { this.recognition.abort(); } catch {} this.recognition = null; }
    this.endRecognition();
    if (this.recorder?.state === 'recording') { this.recorder.ondataavailable = null; this.recorder.stop(); }
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
    this.context?.close().catch(() => {}); this.context = null;
  }
}
