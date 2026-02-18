
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
  Sparkles
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);

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
      // التحقق من بيانات حساب الأدمن الخاصة بك
      if (formData.email === 'nacero1234@gmail.com' && formData.password === 'adminadmin') {
        audioService.playSuccess();
        // تغيير المسار إلى admin
        window.history.pushState({}, '', '/admin');
        // إرسال حدث لتنبيه App.tsx بتغيير المسار
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
      // محاكاة تسجيل دخول مستخدم عادي
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 md:p-6 overflow-hidden relative" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-4xl w-full relative z-10 animate-slide-up">
        {view !== 'stream' ? (
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Left Side: Illustration & Branding */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                  <Globe size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">DzairEdu <span className="text-blue-200">Pro</span></h1>
                <p className="text-blue-100 text-lg font-medium opacity-90 mb-8">
                  المنصة الأولى في الجزائر للتحضير المتفوق لشهادة البكالوريا.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 size={18} className="text-blue-300" />
                    <span className="text-xs font-bold">دروس مرئية مدعومة بالذكاء الاصطناعي</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 size={18} className="text-blue-300" />
                    <span className="text-xs font-bold">ملخصات شاملة لجميع الشعب</span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 mt-12 flex items-center gap-4">
                <div className="flex -space-x-3 space-x-reverse">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i+20}`} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-100" alt="user" />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">+10k طالب مسجل</span>
              </div>

              {/* Decorative shapes */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
              <div className="mb-10 text-center md:text-right">
                <h2 className="text-3xl font-black text-gray-800 mb-2">
                  {view === 'login' ? 'عودة ميمونة! 👋' : 'إنشاء حساب جديد 🎓'}
                </h2>
                <p className="text-gray-400 font-bold text-sm">
                  {view === 'login' ? 'سجل دخولك لمواصلة رحلة التفوق' : 'انضم لآلاف المتفوقين في الجزائر اليوم'}
                </p>
              </div>

              <form onSubmit={view === 'login' ? onLoginSubmit : onSignupSubmit} className="space-y-5">
                {view === 'signup' && (
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
                    <div className="relative group">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input 
                        type="text" 
                        name="name"
                        required
                        placeholder="مثال: أمين بن مسعود" 
                        className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-sm text-right"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-right">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">البريد الإلكتروني</label>
                  <div className="relative group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="name@example.com" 
                      className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-sm text-right"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">كلمة المرور</label>
                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="password" 
                      name="password"
                      required
                      placeholder="••••••••" 
                      className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-sm text-right"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {view === 'signup' && (
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">تأكيد كلمة المرور</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input 
                        type="password" 
                        name="confirmPassword"
                        required
                        placeholder="••••••••" 
                        className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-sm text-right"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse justify-center">
                    <Sparkles size={14} /> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg mt-8"
                >
                  {view === 'login' ? (
                    <>تسجيل الدخول <LogIn size={22} /></>
                  ) : (
                    <>إنشاء الحساب <UserPlus size={22} /></>
                  )}
                </button>

                <div className="mt-8 text-center">
                  <button 
                    type="button"
                    onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); audioService.playClick(); }}
                    className="text-gray-500 font-bold text-xs hover:text-blue-600 transition-colors"
                  >
                    {view === 'login' ? 'ليس لديك حساب؟ انضم إلينا' : 'لديك حساب بالفعل؟ سجل دخولك'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10" dir="rtl">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-200 mb-6 rotate-6 scale-110">
                <GraduationCap size={40} />
              </div>
              <h2 className="text-4xl font-black text-gray-800">الخطوة الأخيرة ✨</h2>
              <p className="text-gray-500 mt-4 text-lg font-medium">يا {formData.name.split(' ')[0]}، اختر شعبتك لتخصيص تجربتك الدراسية</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.keys(STREAM_SUBJECTS).map((streamName) => (
                <button 
                  key={streamName}
                  onClick={() => handleStreamSelect(streamName as StreamType)}
                  className="group p-8 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 hover:shadow-2xl transition-all text-right shadow-sm flex flex-col items-start relative overflow-hidden"
                >
                  <div className="flex items-center justify-between w-full mb-6 relative z-10">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-300">
                      <GraduationCap size={30} />
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                        <ArrowRight size={24} className="rotate-180" />
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-gray-800 relative z-10 mb-2">{streamName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest relative z-10">منهج البكالوريا الجزائري</p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={() => setView('signup')}
                className="text-gray-400 font-bold text-xs hover:text-gray-600 flex items-center gap-2 mx-auto"
              >
                <ArrowRight size={14} /> العودة لتعديل البيانات
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="absolute bottom-6 text-center w-full px-6">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">بكل حب من أجل طلبة الجزائر 🇩🇿</p>
      </footer>
    </div>
  );
};

export default Auth;
