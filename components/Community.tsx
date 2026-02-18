
import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  MessageCircle, 
  Check, 
  Copy,
  ArrowRight
} from 'lucide-react';
import { Post, UserState } from '../types';
import PostsFeed from './PostsFeed';
import { audioService } from '../services/audioService';

interface CommunityProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
}

const Community: React.FC<CommunityProps> = ({ user, posts, onPostUpdate }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateInvite = async () => {
    // توليد رابط فريد محاكى للمستخدم
    const referralCode = user.name.split(' ')[0].toLowerCase() + "_" + Math.floor(Math.random() * 9000 + 1000);
    const inviteLink = `${window.location.origin}/join?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      audioService.playSuccess();
      
      // إعادة الحالة بعد 3 ثوانٍ
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-slide-up pb-24">
      {/* Immersive Community Hero */}
      <div className="relative bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-1 lg:p-1.5 shadow-2xl shadow-blue-100/50 overflow-hidden group border border-gray-100">
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-right">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[11px] font-black mb-6 md:mb-8 shadow-xl shadow-indigo-200 animate-bounce-slow">
                <Sparkles size={14} /> مجتمع النخبة للبكالوريا 2025
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-gray-900 mb-6 md:mb-8 leading-[1.15]">
                ساحة <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 to-blue-500">التفاعل الذكي</span> 🤝
              </h1>
              <p className="text-gray-500 text-base md:text-2xl font-medium leading-relaxed opacity-90 mb-10">
                المكان الذي تلتقي فيه طموحات الطلاب الجزائريين. تبادل الخبرات، اطرح الأسئلة، وكن جزءاً من قصة نجاح زملائك.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-black text-gray-700">1,240 طالب متصل الآن</span>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Zap size={18} className="text-amber-500" />
                    <span className="text-sm font-black text-gray-700">تفاعل فائق السرعة</span>
                 </div>
              </div>
            </div>
            
            <div className="hidden md:block relative">
              <div className="relative z-10 bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 flex flex-col items-center justify-center gap-6 group-hover:scale-105 transition-transform duration-700">
                <div className="flex -space-x-4 space-x-reverse mb-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-16 h-16 rounded-2xl border-4 border-white bg-indigo-100 flex items-center justify-center overflow-hidden shadow-lg">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="student" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-16 h-16 rounded-2xl border-4 border-white bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                    +9k
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">إحصائيات المجتمع</p>
                  <p className="text-2xl font-black text-gray-800">نشاط متواصل 24/7</p>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
        {/* Main Feed Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-3">
              <MessageCircle className="text-indigo-600" size={28} /> آخر التحديثات
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button className="px-3 md:px-4 py-2 bg-white rounded-lg shadow-sm text-[10px] md:text-xs font-black text-gray-800">الأحدث</button>
              <button className="px-3 md:px-4 py-2 text-[10px] md:text-xs font-black text-gray-400 hover:text-gray-600">الأكثر تفاعلاً</button>
            </div>
          </div>
          <PostsFeed user={user} posts={posts} onPostUpdate={onPostUpdate} />
        </div>

        {/* Dynamic Sidebar */}
        <div className="space-y-8 md:space-y-10 sticky top-32">
          {/* Enhanced Referral Widget - NEWLY UPDATED */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 md:p-10 rounded-3xl md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/20 transition-all duration-500 ${isCopied ? 'bg-emerald-500 rotate-[360deg]' : 'bg-white/20 group-hover:rotate-12'}`}>
                  {isCopied ? <Check size={28} className="animate-in zoom-in duration-300" /> : <Users size={28} />}
                </div>
                <h4 className="font-black text-xl md:text-2xl mb-4 leading-tight">ادعُ رفيقك للدراسة 🚀</h4>
                <p className="text-indigo-100 text-xs md:text-sm font-medium mb-8 opacity-90 leading-relaxed">
                  عند انضمام صديق عبر رابطك، ستحصلان معاً على باقة ملخصات حصرية مجانية لتفوقكم في البكالوريا.
                </p>
                <button 
                  onClick={handleGenerateInvite}
                  disabled={isCopied}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                    isCopied 
                      ? 'bg-emerald-500 text-white cursor-default animate-pulse' 
                      : 'bg-white text-indigo-700 hover:shadow-white/20'
                  }`}
                >
                  {isCopied ? (
                    <>تم النسخ بنجاح! <Check size={18} /></>
                  ) : (
                    <>توليد رابط الدعوة <Copy size={18} /></>
                  )}
                </button>
             </div>
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>

          {/* Enhanced Community Rules */}
          <div className="bg-white p-8 md:p-10 rounded-3xl md:rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-50/50 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-black text-lg md:text-xl text-gray-800 mb-8 flex items-center gap-3">
                 <ShieldCheck className="text-indigo-600" size={26} /> الميثاق الأخلاقي
               </h3>
               <div className="space-y-6">
                  {[
                    { text: "نشر المعرفة الموثوقة فقط", color: "bg-blue-50 text-blue-600" },
                    { text: "الاحترام هو لغة الحوار الأساسية", color: "bg-purple-50 text-purple-600" },
                    { text: "مساعدة الزملاء دون انتظار مقابل", color: "bg-emerald-50 text-emerald-600" },
                    { text: "الإبلاغ عن أي محتوى مخالف", color: "bg-rose-50 text-rose-600" }
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-4 group cursor-default">
                      <div className={`w-9 h-9 md:w-10 md:h-10 ${rule.color} rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-transform group-hover:scale-110`}>
                        0{idx + 1}
                      </div>
                      <p className="text-[13px] md:text-sm font-bold text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                        {rule.text}
                      </p>
                    </div>
                  ))}
               </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          </div>

          {/* Trending & Tags Widget */}
          <div className="bg-gray-900 p-8 md:p-10 rounded-3xl md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-black text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-3">
                 <TrendingUp className="text-emerald-400" size={26} /> المواضيع الساخنة
               </h3>
               <div className="flex flex-wrap gap-2.5">
                  {[
                    "#باك_2025", "#منهجية_العلوم", "#مقالات_الفلسفة", 
                    "#المتتاليات", "#الثورة_الجزائرية", "#فيزياء_نووي"
                  ].map((tag) => (
                    <button key={tag} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 hover:bg-indigo-600 rounded-2xl text-[10px] md:text-[11px] font-black border border-white/5 transition-all active:scale-95">
                      {tag}
                    </button>
                  ))}
               </div>
             </div>
             <TrendingUp className="absolute bottom-[-20px] left-[-20px] w-40 h-40 opacity-5 -rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
