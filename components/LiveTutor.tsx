
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Volume2, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

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
        onerror: (e) => {
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
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-blue-900/90 backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col h-[80vh] animate-slide-up">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h3 className="font-black text-xl text-gray-800">الأستاذ الافتراضي المباشر</h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">محادثة صوتية ذكية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50">
          <div className="relative mb-12">
            {/* Pulsing rings */}
            <div className={`absolute inset-0 rounded-full bg-blue-400/20 animate-ping ${isActive ? 'block' : 'hidden'}`}></div>
            <div className={`absolute inset-0 rounded-full bg-blue-400/10 scale-150 animate-pulse ${isSpeaking ? 'block' : 'hidden'}`}></div>
            
            <div className={`w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
              isActive ? (isSpeaking ? 'bg-indigo-600 scale-110' : 'bg-blue-600') : 'bg-gray-200'
            }`}>
              {isConnecting ? (
                <Loader2 size={64} className="text-blue-200 animate-spin" />
              ) : isActive ? (
                isSpeaking ? <Volume2 size={64} className="text-white animate-bounce" /> : <Mic size={64} className="text-white" />
              ) : (
                <MicOff size={64} className="text-gray-400" />
              )}
            </div>
          </div>

          <h4 className="text-2xl font-black text-gray-800 mb-4">
            {isConnecting ? 'جاري الاتصال...' : isActive ? (isSpeaking ? 'الأستاذ يتحدث...' : 'أنا أسمعك، تفضل بسؤالك') : `مرحباً ${userName.split(' ')[0]}!`}
          </h4>
          <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
            {isActive ? 'تحدث بشكل طبيعي باللغة العربية أو الدارجة حول أي درس في البكالوريا.' : 'اضغط على الزر أدناه لبدء جلسة مراجعة صوتية مباشرة مع الذكاء الاصطناعي.'}
          </p>
        </div>

        {/* Footer Controls */}
        <div className="p-10 bg-white border-t border-gray-100 flex flex-col items-center gap-6">
          {!isActive ? (
            <button 
              onClick={startSession}
              disabled={isConnecting}
              className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              <Mic size={24} /> ابدأ التحدث الآن
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-12 py-5 bg-red-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-red-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              <MicOff size={24} /> إنهاء الجلسة
            </button>
          )}
          
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">
            <Sparkles size={12} /> مدعوم بـ Gemini 2.5 Flash Native Audio
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTutor;
