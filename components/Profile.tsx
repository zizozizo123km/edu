
import React, { useState } from 'react';
import { 
  User, Settings, Flame, Award, Target, Calendar, TrendingUp, ShieldCheck, 
  Star, BookOpen, ChevronLeft, GraduationCap, Sparkles, Edit3, Check, X, Save
} from 'lucide-react';
import { UserState, StreamType } from '../types';
import { STREAM_SUBJECTS } from '../constants';
import { db, auth } from '../services/firebaseService';
import { ref, update } from 'firebase/database';
import { audioService } from '../services/audioService';

interface ProfileProps {
  user: UserState;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    stream: user.stream
  });

  const currentSubjects = STREAM_SUBJECTS[user.stream] || [];

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      await update(userRef, {
        name: editData.name,
        stream: editData.stream
      });
      audioService.playSuccess();
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed", error);
      alert("فشل تحديث البيانات. يرجى التحقق من الاتصال.");
    } finally {
      setIsSaving(false);
    }
  };

  const achievements = [
    { title: 'طالب مثابر', desc: 'إكمال 3 أيام متتالية', icon: <Flame size={20} />, color: 'bg-orange-100 text-orange-600' },
    { title: 'المكتشف', desc: 'تحميل 5 ملخصات', icon: <BookOpen size={20} />, color: 'bg-blue-100 text-blue-600' }
  ];

  return (
    <div className="space-y-10 animate-slide-up pb-24 text-right" dir="rtl">
      {/* Profile Header Hero */}
      <div className="relative bg-white rounded-[3.5rem] p-8 md:p-14 border border-gray-100 shadow-xl overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-5xl shadow-2xl border-4 border-white overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}`} className="w-full h-full" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-right w-full">
            {isEditing ? (
              <div className="space-y-4 max-w-sm mx-auto md:mx-0">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الاسم الجديد</label>
                   <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-600 font-bold"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">تغيير الشعبة</label>
                   <select 
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-600 font-bold"
                    value={editData.stream}
                    onChange={(e) => setEditData({...editData, stream: e.target.value as StreamType})}
                   >
                     {Object.keys(STREAM_SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
                  >
                    {isSaving ? "جاري الحفظ..." : <><Save size={16}/> حفظ</>}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-sm"><X size={16}/></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                  <h1 className="text-3xl md:text-4xl font-black text-gray-800">{user.name}</h1>
                  <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100">{user.rank}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 font-bold mb-8">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-500" />
                    <span>شعبة {user.stream}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar size={18} className="text-blue-500" />
                    <span>انضم في {new Date(user.joinDate).toLocaleDateString('ar-DZ')}</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button onClick={() => { setIsEditing(true); audioService.playClick(); }} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all">
                    تعديل الملف <Edit3 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
              <div className="text-2xl font-black text-blue-700">{user.xp}</div>
              <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">XP</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 text-center">
              <div className="text-2xl font-black text-orange-700">{user.streak}</div>
              <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest mt-1">يوم</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-10 flex items-center gap-3">
              <TrendingUp className="text-blue-600" size={24} /> المواد الدراسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentSubjects.map(s => (
                <div key={s.id} className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-black text-gray-700 text-sm">{s.icon} {s.name}</span>
                    <span className="text-[10px] font-black text-gray-400">{s.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                    <div className={`${s.color} h-full transition-all duration-1000`} style={{ width: `${s.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <Target size={32} className="text-emerald-400 mb-6" />
               <h3 className="text-xl font-black mb-4">هدفي القادم</h3>
               <p className="text-gray-400 text-xs font-bold leading-relaxed italic mb-8">
                 "التفوق في شهادة البكالوريا بمعدل مشرف ودخول الجامعة من الباب الواسع."
               </p>
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[60%]"></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
