export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.audioChunks = [];
        
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  createPlaybackUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  async uploadToSupabase(blob: Blob, userId: string, sessionId: string): Promise<string | null> {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const fileName = `${userId}/${sessionId}-${Date.now()}.wav`;

      const { data, error } = await supabase.storage
        .from("audio-recordings")
        .upload(fileName, blob, {
          contentType: "audio/wav",
        });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("audio-recordings")
        .getPublicUrl(fileName);

      return publicData?.publicUrl || null;
    } catch (error) {
      console.error("Error uploading audio:", error);
      return null;
    }
  }
}

export function getDurationFromBlob(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
  });
}
