
import React, { useState } from 'react';
import { 
  LogIn, 
  GraduationCap, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint,
  ChevronLeft
} from 'lucide-react';
import { StreamType, UserState } from '../types';
import { STREAM_SUBJECTS } from '../constants';
import { audioService } from '../services/audioService';

interface AuthProps {
  onComplete: (user: UserState) => void;
}

type AuthView = 'login' | 'signup' | 'stream';

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateLogin = () => {
    if (!formData.email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور قصيرة جداً');
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (formData.name.trim().length < 3) {
      setError('الاسم الكامل مطلوب');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return false;
    }
    return true;
  };

  const handleAdminQuickLogin = () => {
    setIsLoading(true);
    audioService.playSuccess();
    setTimeout(() => {
      onComplete({
        name: 'المشرف العام',
        email: 'nacero1234@gmail.com',
        stream: 'علوم تجريبية',
        xp: 99999,
        streak: 365,
        avatarSeed: 'admin',
        joinDate: new Date().toISOString(),
        rank: 'المشرف العام'
      });
    }, 800);
  };

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogin()) {
      setIsLoading(true);
      setTimeout(() => {
        if (formData.email === 'nacero1234@gmail.com' && formData.password === 'adminadmin') {
          handleAdminQuickLogin();
          return;
        }
        audioService.playSuccess();
        onComplete({
          name: formData.email.split('@')[0],
          email: formData.email,
          stream: 'علوم تجريبية',
          xp: 2450,
          streak: 7,
          avatarSeed: formData.email,
          joinDate: '2024-09-01',
          rank: 'طالب متميز'
        });
        setIsLoading(false);
      }, 1200);
    }
  };

  const onSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignup()) {
      audioService.playClick();
      setView('stream');
    }
  };

  const handleStreamSelect = (stream: StreamType) => {
    audioService.playSuccess();
    onComplete({
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      stream,
      xp: 0,
      streak: 1,
      avatarSeed: formData.name,
      joinDate: new Date().toISOString(),
      rank: 'طالب جديد'
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFDFF] flex flex-col items-center overflow-x-hidden font-['Cairo'] relative pb-10" dir="rtl">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-b-[4rem] shadow-2xl"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-6 flex flex-col items-center">
        
        {/* Mobile Header Branding */}
        <div className="mt-12 mb-10 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 mx-auto rotate-3">
             <Globe size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">DzairEdu <span className="text-blue-200">Pro</span></h1>
          <p className="text-blue-100/80 text-sm font-bold mt-2">رفيقك الذكي للنجاح في البكالوريا</p>
        </div>

        {view !== 'stream' ? (
          <div className="w-full bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white flex flex-col animate-in zoom-in-95 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-800">
                {view === 'login' ? 'مرحباً بعودتك 👋' : 'أنشئ حسابك 🚀'}
              </h2>
              <p className="text-gray-400 text-xs font-bold mt-1">
                {view === 'login' ? 'سجل دخولك لمتابعة مراجعتك' : 'ابدأ رحلة التفوق مع زملائك الآن'}
              </p>
            </div>

            <form onSubmit={view === 'login' ? onLoginSubmit : onSignupSubmit} className="space-y-5">
              {view === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                  <div className="relative group">
                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="اسمك الحقيقي" 
                      className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="example@edu.dz" 
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">كلمة المرور</label>
                <div className="relative group">
                  <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    required
                    placeholder="••••••••" 
                    className="w-full pr-12 pl-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {view === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">تأكيد كلمة المرور</label>
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="confirmPassword"
                      required
                      placeholder="أعد الكتابة" 
                      className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-black text-center border border-red-100 animate-pulse">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : view === 'login' ? (
                  <>دخول آمن <LogIn size={20} /></>
                ) : (
                  <>متابعة التسجيل <ArrowRight size={20} className="rotate-180" /></>
                )}
              </button>

              <div className="pt-4 text-center">
                 <button 
                  type="button"
                  onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); audioService.playClick(); }}
                  className="text-xs font-bold text-gray-400"
                >
                  {view === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب؟ '}
                  <span className="text-blue-600 font-black underline underline-offset-4">
                    {view === 'login' ? 'أنشئ واحداً مجاناً' : 'سجل دخولك'}
                  </span>
                </button>
              </div>
            </form>
            
            {/* Quick Admin Access */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
               <button onClick={handleAdminQuickLogin} className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-blue-600 transition-colors">
                  <Fingerprint size={14} /> الدخول السريع للمشرف
               </button>
            </div>
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white">اختر شعبتك 🎓</h2>
                <p className="text-blue-100/70 text-sm font-bold mt-2">سنقوم بتخصيص المراجعة حسب برنامجك الدراسي</p>
             </div>

             <div className="grid grid-cols-1 gap-4 mb-10">
                {Object.keys(STREAM_SUBJECTS).map((streamName, idx) => (
                  <button 
                    key={streamName}
                    onClick={() => handleStreamSelect(streamName as StreamType)}
                    className="w-full bg-white rounded-[2rem] p-6 flex items-center justify-between border-2 border-transparent hover:border-blue-400 active:scale-95 transition-all shadow-xl group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <GraduationCap size={24} />
                       </div>
                       <div className="text-right">
                          <h4 className="font-black text-gray-800 text-lg">{streamName}</h4>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">منهج البكالوريا 2025</span>
                       </div>
                    </div>
                    <ChevronLeft size={20} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
             </div>

             <button 
                onClick={() => setView('signup')}
                className="w-full py-4 text-white/60 font-black text-sm flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} /> العودة لتعديل البيانات
              </button>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-auto pt-10 text-center opacity-20 select-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">صنع بكل حب للطلبة الجزائريين 🇩🇿</p>
      </div>
    </div>
  );
};

export default Auth;
