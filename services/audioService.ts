
class AudioService {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playClick() {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  playSuccess() {
    this.init();
    if (!this.audioCtx) return;

    const playTone = (freq: number, start: number) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime + start);
      
      gain.gain.setValueAtTime(0, this.audioCtx!.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.1, this.audioCtx!.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx!.currentTime + start + 0.3);
      
      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);
      
      osc.start(this.audioCtx!.currentTime + start);
      osc.stop(this.audioCtx!.currentTime + start + 0.3);
    };

    playTone(523.25, 0); // C5
    playTone(659.25, 0.1); // E5
  }

  speakNative(text: string, onEnd?: () => void) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good Arabic/Google voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.includes('ar') && v.name.includes('Google')) || 
                        voices.find(v => v.lang.includes('ar'));
    
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopNative() {
    window.speechSynthesis.cancel();
  }
}

export const audioService = new AudioService();
