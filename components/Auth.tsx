
import React, { useState } from 'react';
import { 
  LogIn, 
  GraduationCap, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from '../services/firebase.ts';
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

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // محاولة تسجيل الدخول
      const userCredential = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const isAdmin = formData.email.trim().toLowerCase() === 'nacero1234@gmail.com';
      
      audioService.playSuccess();
      
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);
      const userDataFromDb = snapshot.val();

      const userState: UserState = {
        uid: userCredential.user.uid,
        name: isAdmin ? 'المشرف العام' : (userDataFromDb?.name || userCredential.user.displayName || formData.email.split('@')[0]),
        email: formData.email,
        stream: userDataFromDb?.stream || 'علوم تجريبية',
        xp: isAdmin ? 99999 : (userDataFromDb?.xp || 2450),
        streak: isAdmin ? 365 : (userDataFromDb?.streak || 7),
        avatarSeed: isAdmin ? 'admin' : (userDataFromDb?.avatarSeed || userCredential.user.uid),
        joinDate: userCredential.user.metadata.creationTime || new Date().toISOString(),
        rank: isAdmin ? 'المشرف العام' : (userDataFromDb?.rank || 'طالب متميز')
      };

      if (isAdmin) {
        await set(ref(db, `users/${userCredential.user.uid}`), userState);
      }

      onComplete(userState);
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message);
      
      // معالجة الخطأ invalid-credential بشكل صديق للمستخدم
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور، أو "إنشاء حساب" إذا كنت مستخدماً جديداً.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('لقد حاولت الدخول عدة مرات بشكل خاطئ. تم حظر الدخول مؤقتاً لحماية حسابك.');
      } else {
        setError('فشل الاتصال بخدمة المصادقة. يرجى التحقق من الإنترنت.');
      }
      setIsLoading(false);
    }
  };

  const handleStreamSelect = async (stream: StreamType) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      
      const newUser: UserState = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email.trim(),
        stream,
        xp: 0,
        streak: 1,
        avatarSeed: formData.name,
        joinDate: new Date().toISOString(),
        rank: 'طالب جديد'
      };

      await set(ref(db, `users/${userCredential.user.uid}`), newUser);
      audioService.playSuccess();
      onComplete(newUser);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول بدلاً من ذلك.');
        setView('login');
      } else {
        setError('فشل إنشاء الحساب: ' + err.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFDFF] flex flex-col items-center overflow-x-hidden font-['Cairo'] relative pb-10" dir="rtl">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-b-[4rem] shadow-2xl"></div>
      </div>

      <div className="relative z-10 w-full px-6 flex flex-col items-center">
        <div className="mt-12 mb-10 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 mx-auto rotate-3">
             <Globe size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">DzairEdu <span className="text-blue-200">Pro</span></h1>
          <p className="text-blue-100/80 text-sm font-bold mt-2">بوابة الطلاب والمشرفين</p>
        </div>

        {view !== 'stream' ? (
          <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white flex flex-col animate-in zoom-in-95 duration-500">
            <div className="mb-8 text-center md:text-right">
              <h2 className="text-2xl font-black text-gray-800">
                {view === 'login' ? 'مرحباً بك مجدداً' : 'انضم إلينا 🚀'}
              </h2>
              <p className="text-gray-400 text-xs font-bold mt-1">
                {view === 'login' ? 'سجل دخولك للوصول إلى محتواك الدراسي' : 'أنشئ حسابك وابدأ رحلة التفوق'}
              </p>
            </div>

            <form onSubmit={view === 'login' ? onLoginSubmit : (e) => { e.preventDefault(); setView('stream'); }} className="space-y-5">
              {view === 'signup' && (
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                  <div className="relative group">
                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="اسمك الحقيقي" 
                      className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm text-right"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-right">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="example@edu.dz" 
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm text-right"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">كلمة المرور</label>
                <div className="relative group">
                  <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    required
                    placeholder="••••••••" 
                    className="w-full pr-12 pl-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm text-right"
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

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black text-right border border-red-100 flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>{view === 'login' ? 'دخول آمن' : 'المتابعة للشعبة'} <LogIn size={20} /></>
                )}
              </button>

              <div className="pt-4 text-center">
                 <button 
                  type="button"
                  onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); }}
                  className="text-xs font-bold text-gray-400"
                >
                  {view === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب؟ '}
                  <span className="text-blue-600 font-black underline underline-offset-4">
                    {view === 'login' ? 'أنشئ واحداً مجاناً' : 'سجل دخولك'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white">اختر شعبتك 🎓</h2>
                <p className="text-blue-100/70 text-sm font-bold mt-2">سنقوم بتخصيص المراجعة حسب برنامجك الدراسي</p>
             </div>
             <div className="grid grid-cols-1 gap-4 mb-10">
                {Object.keys(STREAM_SUBJECTS).map((streamName) => (
                  <button 
                    key={streamName}
                    onClick={() => handleStreamSelect(streamName as StreamType)}
                    className="w-full bg-white rounded-[2rem] p-6 flex items-center justify-between border-2 border-transparent hover:border-blue-400 active:scale-95 transition-all shadow-xl group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <GraduationCap size={24} />
                       </div>
                       <h4 className="font-black text-gray-800 text-lg">{streamName}</h4>
                    </div>
                    <ChevronLeft size={20} className="text-gray-300 group-hover:text-blue-600" />
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
