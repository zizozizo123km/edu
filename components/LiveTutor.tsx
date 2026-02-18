
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, PhoneOff, Phone, BrainCircuit, Sparkles, Loader2, User, MoreHorizontal, MessageSquare } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { LiveServerMessage, Blob } from '@google/genai';

interface LiveTutorProps {
  onClose: () => void;
  userName: string;
}

const LiveTutor: React.FC<LiveTutorProps> = ({ onClose, userName }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper functions for audio encoding/decoding
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = geminiService.connectLive({
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            if (isMuted) return; // Simple mute logic
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            setIsSpeaking(true);
            const ctx = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsSpeaking(false);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsSpeaking(false);
          }
        },
        onerror: (e: any) => {
          console.error('Live Tutor Error:', e);
          stopSession();
        },
        onclose: () => stopSession(),
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsMuted(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center bg-[#050A18] text-white font-['Cairo'] overflow-hidden animate-in fade-in duration-500">
      
      {/* Immersive Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15)_0%,transparent_50%)] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-30'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1)_0%,transparent_50%)]`}></div>
        {isSpeaking && (
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse duration-700"></div>
        )}
      </div>

      {/* Top Section: Identity & Status */}
      <div className="relative z-10 w-full px-8 pt-16 flex flex-col items-center text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl mx-auto">
            <BrainCircuit size={32} className="text-blue-400" />
          </div>
        </div>
        
        <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">الأستاذ الافتراضي</h3>
        
        <div className="flex flex-col items-center">
          {isConnecting ? (
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm animate-pulse">
              <Loader2 size={16} className="animate-spin" /> جاري الاتصال...
            </div>
          ) : isActive ? (
            <div className="space-y-1">
              <p className="text-blue-400 font-black text-sm uppercase tracking-widest">{isSpeaking ? 'يتحدث الآن...' : 'بانتظارك...'}</p>
              <p className="text-white/60 font-mono text-lg font-bold">{formatDuration(callDuration)}</p>
            </div>
          ) : (
            <p className="text-white/40 font-bold text-sm">مكالمة ذكية مشفرة</p>
          )}
        </div>
      </div>

      {/* Center Section: Visualizer / Avatar */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center py-12">
        <div className="relative">
          {/* Animated Ripples */}
          {isActive && (
            <>
              <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping duration-[3s]`}></div>
              <div className={`absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping duration-[4s] delay-700`}></div>
              {isSpeaking && (
                 <div className="absolute inset-[-40px] rounded-full border border-blue-400/10 animate-pulse"></div>
              )}
            </>
          )}

          {/* Main Visualizer Orb */}
          <div className={`
            w-44 h-44 md:w-56 md:h-56 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.2)] transition-all duration-700 relative z-20 border-4
            ${isActive ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-white/20' : 'bg-white/5 border-white/5'}
            ${isSpeaking ? 'scale-110 shadow-[0_0_100px_rgba(37,99,235,0.4)]' : 'scale-100'}
          `}>
            {isConnecting ? (
              <Loader2 size={64} className="text-blue-200 animate-spin" />
            ) : isActive ? (
              <div className="flex items-center gap-1.5 h-12">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className={`w-1.5 bg-white rounded-full transition-all duration-300 ${isSpeaking ? 'animate-bounce-slow' : 'h-2 opacity-50'}`}
                    style={{ 
                      height: isSpeaking ? `${Math.random() * 40 + 20}px` : '8px',
                      animationDelay: `${i * 0.1}s` 
                    }}
                  ></div>
                ))}
              </div>
            ) : (
              <User size={80} className="text-white/10" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Call Controls */}
      <div className="relative z-10 w-full px-8 pb-20 md:pb-24">
        <div className="max-w-md mx-auto">
          {isActive ? (
            <div className="grid grid-cols-3 gap-6 items-center">
              {/* Mute Button */}
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all active:scale-90 ${
                    isMuted ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <span className="text-[10px] font-black uppercase text-white/50">{isMuted ? 'إلغاء الكتم' : 'كتم'}</span>
              </div>

              {/* End Call Button */}
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={stopSession}
                  className="w-20 h-20 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-900/40 active:scale-95 transition-all"
                >
                  <PhoneOff size={32} />
                </button>
                <span className="text-[10px] font-black uppercase text-red-500">إنهاء</span>
              </div>

              {/* Speaker/Volume Button */}
              <div className="flex flex-col items-center gap-3">
                <button 
                  className="w-16 h-16 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-90 transition-all"
                >
                  <Volume2 size={24} />
                </button>
                <span className="text-[10px] font-black uppercase text-white/50">مكبر الصوت</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 items-center">
               <div className="flex gap-10">
                  <button className="flex flex-col items-center gap-2 text-white/40 hover:text-blue-400 transition-colors">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/5"><MessageSquare size={20} /></div>
                    <span className="text-[10px] font-black">رسالة</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-white/40 hover:text-blue-400 transition-colors">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/5"><MoreHorizontal size={20} /></div>
                    <span className="text-[10px] font-black">المزيد</span>
                  </button>
               </div>

               <button 
                onClick={startSession}
                disabled={isConnecting}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                {isConnecting ? <Loader2 className="animate-spin" /> : <><Phone size={24} fill="currentColor" /> اتصال ذكي مباشر</>}
              </button>

              <button 
                onClick={onClose}
                className="text-white/30 font-bold text-sm hover:text-white transition-colors"
              >
                إغلاق الواجهة
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Branding Footnote */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-20">
         <div className="flex items-center justify-center gap-2 text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">
            <Sparkles size={10} /> DzairEdu Pro AI <Sparkles size={10} />
         </div>
      </div>
    </div>
  );
};

export default LiveTutor;
