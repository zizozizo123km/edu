
import React, { useState } from 'react';
import { LogIn, GraduationCap, ChevronRight, Globe, User } from 'lucide-react';
import { StreamType, UserState } from '../types';
import { STREAM_SUBJECTS } from '../constants';

interface AuthProps {
  onComplete: (user: UserState) => void;
}

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'login' | 'stream'>('login');
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (name.trim()) {
      setStep('stream');
    }
  };

  const handleStreamSelect = (stream: StreamType) => {
    onComplete({
      name,
      stream,
      xp: 1250, // Default starting XP for demo
      streak: 3, // Default starting streak for demo
      avatarSeed: name,
      joinDate: new Date().toISOString(),
      rank: 'طالب مجتهد'
    });
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 animate-slide-up">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-200 mb-6 transform rotate-6">
              <Globe size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">مرحباً بك في DzairEdu Pro</h2>
            <p className="text-gray-500 font-medium mt-3">منصتك المتكاملة للتحضير للبكالوريا</p>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-1 tracking-widest">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  placeholder="مثال: أمين مسعودي" 
                  className="w-full pr-12 pl-4 py-5 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-right text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={handleLogin}
              disabled={!name.trim()}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              دخول <LogIn size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 animate-slide-up">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-800">اختر شعبتك الدراسية 🎓</h2>
          <p className="text-gray-500 mt-4 text-lg">سنقوم بتخصيص المحتوى والبرنامج حسب شعبتك لضمان أفضل النتائج</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.keys(STREAM_SUBJECTS).map((streamName) => (
            <button 
              key={streamName}
              onClick={() => handleStreamSelect(streamName as StreamType)}
              className="group p-8 bg-white rounded-[2rem] border-2 border-transparent hover:border-blue-600 hover:shadow-2xl transition-all text-right shadow-sm flex flex-col items-start"
            >
              <div className="flex items-center justify-between w-full mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-300">
                  <GraduationCap size={30} />
                </div>
                <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                    <ChevronRight size={24} className="rotate-180" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-gray-800">{streamName}</h4>
              <p className="text-sm text-gray-400 font-bold mt-2">بكالوريا 2026 - برنامج وزارة التربية</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;
