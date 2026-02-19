
import React, { useState } from 'react';
import { 
  LogIn, GraduationCap, Globe, User, Mail, Lock, 
  ArrowRight, Sparkles, Eye, EyeOff, AlertTriangle, Loader2
} from 'lucide-react';
import { StreamType, UserState } from '../types';
import { STREAM_SUBJECTS } from '../constants';
import { audioService } from '../services/audioService';
import { auth, db } from '../services/firebaseService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://esm.sh/firebase@10.8.0/auth";
import { ref, set } from "https://esm.sh/firebase@10.8.0/database";

interface AuthProps {
  onComplete: (user: UserState) => void;
}

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [view, setView] = useState<'login' | 'signup' | 'stream'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      audioService.playSuccess();
      // App.tsx will detect auth change and call onComplete
    } catch (err: any) {
      setError("خطأ في البريد أو كلمة المرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamSelect = async (stream: StreamType) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      const userData: UserState = {
        name: formData.name,
        email: formData.email,
        stream: stream,
        xp: 0,
        streak: 1,
        avatarSeed: formData.name,
        joinDate: new Date().toISOString(),
        rank: 'طالب جديد'
      };

      await set(ref(db, `users/${user.uid}`), userData);
      audioService.playSuccess();
      onComplete(userData);
    } catch (err: any) {
      setError(err.message.includes('email-already-in-use') ? "البريد مسجل مسبقاً" : "حدث خطأ أثناء التسجيل");
      setView('signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFDFF] flex flex-col items-center justify-center p-6 relative font-['Cairo']" dir="rtl">
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-b-[4rem] z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 mx-auto rotate-3">
             <Globe size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-white">DzairEdu <span className="text-blue-200">Pro</span></h1>
        </div>

        {view !== 'stream' ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-gray-800 mb-8">
              {view === 'login' ? 'مرحباً بعودتك 👋' : 'أنشئ حسابك 🚀'}
            </h2>

            <form onSubmit={view === 'login' ? handleLogin : (e) => { e.preventDefault(); setView('stream'); }} className="space-y-5">
              {view === 'signup' && (
                <input type="text" name="name" required placeholder="الاسم الكامل" 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none font-bold text-sm"
                  value={formData.name} onChange={handleInputChange} />
              )}
              <input type="email" name="email" required placeholder="البريد الإلكتروني" 
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none font-bold text-sm"
                value={formData.email} onChange={handleInputChange} />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required placeholder="كلمة المرور" 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none font-bold text-sm"
                  value={formData.password} onChange={handleInputChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-black text-center flex items-center justify-center gap-2"><AlertTriangle size={14}/> {error}</div>}

              <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                {isLoading ? <Loader2 className="animate-spin" /> : (view === 'login' ? 'دخول' : 'متابعة')}
              </button>

              <button type="button" onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="w-full text-center text-xs font-bold text-gray-400">
                {view === 'login' ? 'ليس لديك حساب؟ اشترك' : 'لديك حساب؟ سجل دخول'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-500">
             <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">اختر شعبتك 🎓</h2>
             <div className="space-y-3">
                {Object.keys(STREAM_SUBJECTS).map((stream) => (
                  <button key={stream} onClick={() => handleStreamSelect(stream as StreamType)}
                    className="w-full bg-gray-50 rounded-2xl p-5 flex items-center justify-between border-2 border-transparent hover:border-blue-400 transition-all font-black text-gray-700"
                  >
                    {stream} <ArrowRight size={18} className="rotate-180" />
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
