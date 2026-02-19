
import React, { useState } from 'react';
import { 
  User, Settings, Flame, Award, Target, Calendar, 
  TrendingUp, ShieldCheck, Star, BookOpen, ChevronLeft, 
  GraduationCap, Sparkles, RefreshCw, Check, Loader2, X
} from 'lucide-react';
import { UserState, StreamType } from '../types';
import { STREAM_SUBJECTS } from '../constants';
import { db, auth } from '../services/firebaseService';
import { ref, update } from "firebase/database";
import { audioService } from '../services/audioService';

interface ProfileProps {
  user: UserState;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    stream: user.stream as StreamType,
    avatarSeed: user.avatarSeed
  });

  const currentSubjects = STREAM_SUBJECTS[user.stream] || [];

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    audioService.playClick();
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        await update(userRef, {
          name: editForm.name,
          stream: editForm.stream,
          avatarSeed: editForm.avatarSeed
        });
        setIsEditing(false);
        audioService.playSuccess();
      }
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setEditForm({ ...editForm, avatarSeed: newSeed });
    audioService.playClick();
  };

  const achievements = [
    { title: 'طالب مثابر', desc: 'إكمال 3 أيام متتالية', icon: <Flame size={20} />, color: 'bg-orange-100 text-orange-600' },
    { title: 'المكتشف', desc: 'تحميل 5 ملخصات', icon: <BookOpen size={20} />, color: 'bg-blue-100 text-blue-600' },
    { title: 'نجم المجتمع', desc: 'نشر أول منشور مفيد', icon: <Star size={20} />, color: 'bg-amber-100 text-amber-600' },
    { title: 'المستمع الجيد', desc: 'استخدام الأستاذ الصوتي', icon: <Sparkles size={20} />, color: 'bg-indigo-100 text-indigo-600' }
  ];

  return (
    <div className="space-y-10 animate-slide-up pb-24 text-right" dir="rtl">
      {/* Profile Header Hero */}
      <div className="relative bg-white rounded-[3.5rem] p-10 lg:p-14 border border-gray-100 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-5xl md:text-7xl shadow-2xl border-4 border-white overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${isEditing ? editForm.avatarSeed : user.avatarSeed}`} className="w-full h-full object-cover" />
              {isEditing && (
                <button onClick={regenerateAvatar} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCw size={32} className="text-white animate-spin-slow" />
                </button>
              )}
            </div>
            {!isEditing && (
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg animate-bounce-slow">
                <ShieldCheck size={24} />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-right w-full">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الاسم الكامل</label>
                  <input type="text" className="w-full md:w-80 px-6 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-gray-800"
                    value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الشعبة الدراسية</label>
                  <select className="w-full md:w-80 px-6 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-gray-800 appearance-none"
                    value={editForm.stream} onChange={(e) => setEditForm({ ...editForm, stream: e.target.value as StreamType })}>
                    {Object.keys(STREAM_SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  <button onClick={handleUpdateProfile} disabled={isSaving} className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Check size={18} /> حفظ التعديلات</>}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-500 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                  <h1 className="text-4xl font-black text-gray-800">{user.name}</h1>
                  <span className="px-5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black border border-blue-100 shadow-sm">{user.rank}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 font-bold mb-8">
                  <div className="flex items-center gap-2"><GraduationCap size={18} className="text-blue-500" /><span>شعبة {user.stream}</span></div>
                  <div className="flex items-center gap-2"><Calendar size={18} className="text-blue-500" /><span>انضم في {new Date(user.joinDate).toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' })}</span></div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button onClick={() => { setIsEditing(true); audioService.playClick(); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">تعديل الملف <Settings size={18} /></button>
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
              <div className="text-3xl font-black text-blue-700">{user.xp}</div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">إجمالي النقاط</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 text-center">
              <div className="text-3xl font-black text-orange-700">{user.streak}</div>
              <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">يوم متتالي</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-800 mb-10 flex items-center gap-3"><TrendingUp className="text-blue-600" size={28} /> حالة التقدم الأكاديمي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentSubjects.map(s => (
                <div key={s.id} className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3"><span className="text-xl">{s.icon}</span><span className="font-black text-gray-700">{s.name}</span></div>
                    <span className="text-xs font-black text-gray-400">{s.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                    <div className={`${s.color} h-full transition-all duration-1000 shadow-inner`} style={{ width: `${s.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-800 mb-10 flex items-center gap-3"><Award className="text-blue-600" size={28} /> إنجازاتي</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:shadow-md transition-all group">
                  <div className={`w-16 h-16 ${ach.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform`}>{ach.icon}</div>
                  <div><h4 className="font-black text-gray-800 text-lg mb-1">{ach.title}</h4><p className="text-sm text-gray-400 font-bold">{ach.desc}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-12 transition-transform"><Target size={32} className="text-emerald-400" /></div>
              <h3 className="text-2xl font-black mb-4">هدفي القادم</h3>
              <p className="text-gray-400 font-bold mb-8 leading-relaxed italic">"أطمح للحصول على معدل 18.5 في البكالوريا والدخول لكلية الطب بجامعة الجزائر."</p>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black"><span className="text-gray-500">إنجاز الهدف</span><span className="text-emerald-400">45%</span></div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[45%] rounded-full shadow-lg"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
