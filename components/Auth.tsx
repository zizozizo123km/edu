
import React, { useState } from 'react';
import { 
  LogIn, GraduationCap, Globe, User, Mail, Lock, UserPlus, ArrowRight,
  ShieldCheck, Sparkles, Eye, EyeOff, Fingerprint, ChevronLeft, AlertTriangle
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
          message: "يجب تفعيل (Email/Password) في إعدادات Firebase Console أولاً.",
          code: err.code 
        };
      case 'auth/email-already-in-use':
        return { message: "هذا البريد الإلكتروني مسجل مسبقاً. حاول تسجيل الدخول." };
      case 'auth/weak-password':
        return { message: "كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل." };
      case 'auth/invalid-email':
        return { message: "صيغة البريد الإلكتروني غير صحيحة." };
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
      case 'auth/network-request-failed':
        return { message: "فشل الاتصال بالإنترنت. يرجى التحقق من الشبكة." };
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
      setView('signup'); // العودة لتصحيح البيانات في حال الخطأ
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFDFF] flex flex-col items-center overflow-x-hidden relative" dir="rtl">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-b-[4rem]"></div>
      </div>

      <div className="relative z-10 w-full px-6 flex flex-col items-center max-w-md">
        <div className="mt-12 mb-10 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 mx-auto rotate-3">
             <Globe size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-white">DzairEdu <span className="text-blue-200">Pro</span></h1>
        </div>

        {view !== 'stream' ? (
          <div className="w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-gray-800 mb-8">
              {view === 'login' ? 'مرحباً بعودتك 👋' : 'أنشئ حسابك 🚀'}
            </h2>

            <form onSubmit={view === 'login' ? onLoginSubmit : (e) => { e.preventDefault(); setView('stream'); }} className="space-y-5">
              {view === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الاسم الكامل</label>
                  <input type="text" name="name" required placeholder="اسمك الحقيقي" 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-sm"
                    value={formData.name} onChange={handleInputChange} />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                <input type="email" name="email" required placeholder="example@edu.dz" 
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
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-slide-up">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} />
                    <span className="text-[11px] font-black uppercase">تنبيه من النظام</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed">{error.message}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Sparkles className="animate-spin" /> : (view === 'login' ? 'دخول آمن' : 'متابعة')}
              </button>

              <button type="button" onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); }} className="w-full text-center text-xs font-bold text-gray-400">
                {view === 'login' ? 'ليس لديك حساب؟ أنشئ واحداً' : 'لديك حساب؟ سجل دخولك'}
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full animate-in slide-in-from-bottom duration-500">
             <h2 className="text-3xl font-black text-white text-center mb-8">اختر شعبتك 🎓</h2>
             <div className="space-y-4">
                {Object.keys(STREAM_SUBJECTS).map((stream) => (
                  <button key={stream} onClick={() => handleStreamSelect(stream as StreamType)}
                    className="w-full bg-white rounded-2xl p-6 flex items-center justify-between border-2 border-transparent hover:border-blue-400 transition-all shadow-xl group"
                  >
                    <span className="font-black text-gray-800 text-lg">{stream}</span>
                    <ChevronLeft size={20} className="text-gray-300 group-hover:text-blue-600" />
                  </button>
                ))}
             </div>
             <button onClick={() => setView('signup')} className="w-full mt-8 text-center text-white/60 font-black text-sm hover:text-white transition-colors">
               &larr; العودة لتعديل البيانات
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
