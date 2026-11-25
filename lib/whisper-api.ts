// No API credentials belong in browser code. Recording and optional browser
// transcription are implemented in audio-recorder.ts. A future hosted
// transcription integration must run on an authenticated server endpoint.
export async function analyzeSpeechWithWhisper(_audioBlob: Blob): Promise<never> {
  throw new Error('Hosted transcription is not configured. Use the recording exercise with optional browser transcription.');
}
