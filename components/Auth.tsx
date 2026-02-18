
import React, { useState } from 'react';
import { 
  LogIn, 
  GraduationCap, 
  ChevronRight, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint
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
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (formData.name.trim().length < 3) {
      setError('الاسم الكامل قصير جداً');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return false;
    }
    return true;
  };

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogin()) {
      setIsLoading(true);
      setTimeout(() => {
        if (formData.email === 'nacero1234@gmail.com' && formData.password === 'adminadmin') {
          audioService.playSuccess();
          window.history.pushState({}, '', '/admin');
          window.dispatchEvent(new PopStateEvent('popstate'));
          onComplete({
            name: 'المشرف العام',
            email: formData.email,
            stream: '',
            xp: 99999,
            streak: 365,
            avatarSeed: 'admin-nacer',
            joinDate: new Date().toISOString(),
            rank: 'المشرف العام'
          });
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
      }, 1500);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-6 overflow-hidden relative font-['Cairo']" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="max-w-5xl w-full relative z-10">
        {view !== 'stream' ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row min-h-[650px] animate-in fade-in zoom-in duration-500">
            {/* Left Side: Illustration & Branding - Hidden on mobile or scrollable */}
            <div className="w-full md:w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl transition-transform hover:rotate-12">
                  <Globe size={32} className="md:w-10 md:h-10 text-blue-100" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tighter">DzairEdu <span className="text-blue-300">Pro</span></h1>
                <p className="text-blue-100 text-lg md:text-xl font-medium opacity-90 mb-10 leading-relaxed">
                  المنصة التعليمية الأكثر ذكاءً للبكالوريا في الجزائر. رفيقك الرقمي للتفوق.
                </p>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center text-blue-200">
                      <Fingerprint size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">أمان عالي</h4>
                      <p className="text-[10px] opacity-70">بياناتك محمية بأحدث التقنيات</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
                    <div className="w-10 h-10 bg-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-200">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">تجربة الهاتف</h4>
                      <p className="text-[10px] opacity-70">واجهة متفاعلة وسلسة على الجوال</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 mt-12 flex flex-col items-center md:items-start gap-4">
                <div className="flex -space-x-3 space-x-reverse">
                  {[1,2,3,4,5].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i+42}`} className="w-12 h-12 rounded-full border-4 border-blue-700 bg-blue-100 shadow-lg" alt="user" />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                   <span className="text-xs font-black uppercase tracking-widest text-blue-200">أكثر من 25,000 طالب متفوق</span>
                </div>
              </div>

              {/* Decorative shapes */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
              <div className="absolute top-1/4 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px]"></div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col justify-center bg-white/50 relative">
              <div className="mb-12 text-center md:text-right">
                <div className="inline-block md:hidden mb-6">
                   <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto">
                      <Globe size={28} />
                   </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 tracking-tight">
                  {view === 'login' ? 'مرحباً بعودتك! 👋' : 'انضم إلينا 🚀'}
                </h2>
                <p className="text-gray-400 font-bold text-sm md:text-base">
                  {view === 'login' ? 'سجل دخولك لتكمل مراجعتك الذكية' : 'ابدأ رحلة النجاح في بكالوريا 2025 الآن'}
                </p>
              </div>

              <form onSubmit={view === 'login' ? onLoginSubmit : onSignupSubmit} className="space-y-6">
                {view === 'signup' && (
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                    <div className="relative group">
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                        <User size={22} />
                      </div>
                      <input 
                        type="text" 
                        name="name"
                        required
                        placeholder="أدخل اسمك الحقيقي" 
                        className="w-full pr-14 pl-5 py-5 bg-gray-50/50 border-2 border-transparent rounded-3xl focus:border-blue-600 focus:bg-white focus:ring-[6px] focus:ring-blue-100 outline-none transition-all font-bold text-base text-right shadow-sm"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-right">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                  <div className="relative group">
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                      <Mail size={22} />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="example@edu.dz" 
                      className="w-full pr-14 pl-5 py-5 bg-gray-50/50 border-2 border-transparent rounded-3xl focus:border-blue-600 focus:bg-white focus:ring-[6px] focus:ring-blue-100 outline-none transition-all font-bold text-base text-right shadow-sm"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">كلمة المرور</label>
                    {view === 'login' && <button type="button" className="text-[10px] font-black text-blue-600">نسيت كلمة المرور؟</button>}
                  </div>
                  <div className="relative group">
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={22} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      required
                      placeholder="••••••••" 
                      className="w-full pr-14 pl-14 py-5 bg-gray-50/50 border-2 border-transparent rounded-3xl focus:border-blue-600 focus:bg-white focus:ring-[6px] focus:ring-blue-100 outline-none transition-all font-bold text-base text-right shadow-sm"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {view === 'signup' && (
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">تأكيد كلمة المرور</label>
                    <div className="relative group">
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                        <ShieldCheck size={22} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="confirmPassword"
                        required
                        placeholder="••••••••" 
                        className="w-full pr-14 pl-5 py-5 bg-gray-50/50 border-2 border-transparent rounded-3xl focus:border-blue-600 focus:bg-white focus:ring-[6px] focus:ring-blue-100 outline-none transition-all font-bold text-base text-right shadow-sm"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-[1.5rem] text-xs font-black flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Sparkles size={16} /> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-lg mt-8 disabled:opacity-70 group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : view === 'login' ? (
                    <>دخول الآمن <LogIn size={24} className="group-hover:translate-x-1 transition-transform" /></>
                  ) : (
                    <>أنشئ حسابك <UserPlus size={24} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>

                <div className="mt-8 text-center">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="flex-1 h-px bg-gray-100"></div>
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">أو</span>
                     <div className="flex-1 h-px bg-gray-100"></div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); audioService.playClick(); }}
                    className="group flex flex-col items-center gap-2 mx-auto"
                  >
                    <span className="text-gray-400 font-bold text-xs">{view === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}</span>
                    <span className="text-blue-600 font-black text-sm border-b-2 border-transparent group-hover:border-blue-600 transition-all">
                      {view === 'login' ? 'انضم إلينا الآن مجاناً' : 'سجل دخولك من هنا'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500" dir="rtl">
            <div className="text-center relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-600 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center text-white mx-auto shadow-[0_20px_50px_rgba(37,99,235,0.3)] mb-8 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <GraduationCap size={60} className="md:w-20 md:h-20" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tighter">الخطوة الذهبية ✨</h2>
              <p className="text-gray-400 mt-6 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                أهلاً بك يا <span className="text-blue-600 font-black">{formData.name.split(' ')[0]}</span>، اختر شعبتك لتخصيص كامل ميزات الذكاء الاصطناعي لك.
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
              {Object.keys(STREAM_SUBJECTS).map((streamName, idx) => (
                <button 
                  key={streamName}
                  onClick={() => handleStreamSelect(streamName as StreamType)}
                  className="group p-8 md:p-10 bg-white/70 backdrop-blur-md rounded-[3rem] border-2 border-transparent hover:border-blue-600 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-3 transition-all text-right shadow-sm flex flex-col items-start relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between w-full mb-8 relative z-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-sm">
                      <GraduationCap size={32} />
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
                        <ArrowRight size={24} className="rotate-180" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-gray-800 relative z-10 mb-3 group-hover:text-blue-600 transition-colors">{streamName}</h4>
                  <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] relative z-10">منهج البكالوريا 2025</p>
                  
                  {/* Decorative element inside card */}
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 ease-out opacity-40"></div>
                </button>
              ))}
            </div>

            <div className="text-center pb-12">
              <button 
                onClick={() => { setView('signup'); audioService.playClick(); }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
              >
                <ArrowRight size={20} /> العودة لتعديل بيانات الحساب
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-6 text-center w-full px-6 opacity-30 select-none pointer-events-none">
        <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">صنع بكل حب لخدمة التعليم في الجزائر 🇩🇿</p>
      </footer>
    </div>
  );
};

export default Auth;
