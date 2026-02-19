
import React, { useState } from 'react';
import { 
  LogIn, Globe, Mail, Lock, Sparkles, Eye, EyeOff, ChevronLeft, AlertTriangle, ArrowRight
} from 'lucide-react';
import { StreamType } from '../types';
import { STREAM_SUBJECTS } from '../constants';
import { auth, db } from '../services/firebaseService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { audioService } from '../services/audioService';

interface AuthProps {
  onComplete: () => void;
}

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [view, setView] = useState<'login' | 'signup' | 'stream'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    stream: '' as StreamType | ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const parseError = (err: any) => {
    console.error("Auth Error Code:", err.code);
    switch (err.code) {
      case 'auth/operation-not-allowed':
        return { 
          message: "خطأ في الإعدادات: يجب تفعيل تسجيل الدخول بالبريد في لوحة تحكم Firebase (Authentication > Sign-in method).",
          code: err.code 
        };
      case 'auth/email-already-in-use':
        return { message: "هذا البريد مسجل مسبقاً، حاول تسجيل الدخول." };
      case 'auth/weak-password':
        return { message: "كلمة المرور ضعيفة، يجب أن تكون 6 خانات على الأقل." };
      case 'auth/invalid-email':
        return { message: "صيغة البريد الإلكتروني غير صحيحة." };
      case 'auth/invalid-credential':
        return { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
      default:
        return { message: "حدث خطأ غير متوقع: " + (err.message || "حاول ثانية") };
    }
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      audioService.playSuccess();
      onComplete();
    } catch (err: any) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamSelect = async (stream: StreamType) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        stream: stream,
        xp: 0,
        streak: 1,
        avatarSeed: formData.name,
        joinDate: new Date().toISOString(),
        rank: 'طالب جديد'
      });
      
      audioService.playSuccess();
      onComplete();
    } catch (err: any) {
      setError(parseError(err));
      setView('signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFDFF] flex flex-col items-center justify-center p-6 relative" dir="rtl">
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-b-[4rem] z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 mx-auto rotate-3">
             <Globe size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-white italic">DzairEdu <span className="text-blue-200">Pro</span></h1>
        </div>

        {view !== 'stream' ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-gray-800 mb-8">
              {view === 'login' ? 'مرحباً بعودتك 👋' : 'أنشئ حسابك 🚀'}
            </h2>

            <form onSubmit={view === 'login' ? onLoginSubmit : (e) => { e.preventDefault(); setView('stream'); }} className="space-y-5">
              {view === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الاسم الحقيقي</label>
                  <input type="text" name="name" required placeholder="مثال: أحمد محمد" 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-sm"
                    value={formData.name} onChange={handleInputChange} />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                <input type="email" name="email" required placeholder="example@gmail.com" 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-sm"
                  value={formData.email} onChange={handleInputChange} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">كلمة المرور</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••" 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-sm"
                    value={formData.password} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex gap-3 animate-slide-up">
                  <AlertTriangle size={20} className="shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">{error.message}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Sparkles className="animate-spin" /> : (view === 'login' ? 'دخول آمن' : 'متابعة الخطوة الأخيرة')}
              </button>

              <button type="button" onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); }} className="w-full text-center text-xs font-bold text-gray-400">
                {view === 'login' ? 'ليس لديك حساب؟ اشترك الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-in slide-in-from-bottom duration-500">
             <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">اختر شعبتك 🎓</h2>
             <p className="text-xs font-bold text-gray-400 text-center mb-8 leading-relaxed px-4">هذه الخطوة مهمة لتزويدك بملخصات وأسئلة مخصصة لبرنامجك الدراسي الرسمي.</p>
             <div className="space-y-3">
                {Object.keys(STREAM_SUBJECTS).map((stream) => (
                  <button key={stream} onClick={() => handleStreamSelect(stream as StreamType)}
                    className="w-full bg-gray-50 rounded-2xl p-5 flex items-center justify-between border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <span className="font-black text-gray-700">{stream}</span>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600" />
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
