
import React from 'react';
import { BookOpen, TrendingUp, Trophy, Target, Flame, Star, ChevronLeft } from 'lucide-react';
import { Subject, UserState, Post } from '../types';
import { STREAM_SUBJECTS } from '../constants';
import PostsFeed from './PostsFeed';

interface DashboardProps {
  user: UserState;
  onPostUpdate: (posts: Post[]) => void;
  posts: Post[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, posts, onPostUpdate }) => {
  const currentSubjects = STREAM_SUBJECTS[user.stream] || [];

  return (
    <div className="space-y-6 md:space-y-10 animate-slide-up">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-violet-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl">
        <div className="relative z-10 lg:flex items-center justify-between">
          <div className="max-w-xl text-center md:text-right">
            <h1 className="text-2xl md:text-4xl font-black mb-2 md:mb-4 leading-tight tracking-tight">بالتوفيق يا {user.name.split(' ')[0]}! 🚀</h1>
            <p className="text-blue-100 text-sm md:text-lg font-medium opacity-90">
              أنت تدرس شعبة <span className="bg-white/20 px-2 py-0.5 rounded-md font-black">{user.stream}</span>. 
            </p>
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <button className="bg-white text-blue-800 px-6 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2">
                خطة اليوم <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 font-bold text-xs md:text-sm">
                <Flame className="text-orange-400" size={16} /> {user.streak} أيام متتالية
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/10">
            <div className="text-center">
                <div className="text-3xl font-black">1.2k</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">XP</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
                <div className="text-3xl font-black">12</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">تمارين</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          <section>
            <div className="flex justify-between items-center mb-6 px-1">
              <h2 className="text-lg md:text-2xl font-black text-gray-800 flex items-center gap-2">
                <BookOpen className="text-blue-600" size={20} /> موادي الدراسية
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentSubjects.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 ${s.color} rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-4xl text-white shadow-lg`}>{s.icon}</div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-base md:text-xl font-black text-gray-800 leading-tight truncate">{s.name}</h3>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">{s.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black px-1">
                      <span className="text-gray-400">التقدم</span>
                      <span className="text-blue-600">{s.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                      <div className={`${s.color} h-full transition-all duration-1000 rounded-full`} style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
             <h2 className="text-lg md:text-2xl font-black text-gray-800 mb-6 flex items-center gap-2 px-1">
              <TrendingUp className="text-blue-600" size={20} /> مجتمع المتفوقين
            </h2>
            <PostsFeed user={user} posts={posts} onPostUpdate={onPostUpdate} />
          </section>
        </div>

        {/* Sidebar for Desktop / Bottom Content for Mobile */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="font-black text-base md:text-xl text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="text-amber-500" size={20} /> لوحة الشرف
            </h3>
            <div className="space-y-3 md:space-y-4">
              {[
                { name: "أيمن رحماني", xp: "2,450", rank: 1, color: "bg-amber-100 text-amber-600" },
                { name: "ليلى قاصدي", xp: "2,100", rank: 2, color: "bg-slate-100 text-slate-600" }
              ].map(student => (
                <div key={student.rank} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                  <div className={`w-8 h-8 ${student.color} rounded-lg flex items-center justify-center font-black text-xs shrink-0`}>#{student.rank}</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black text-gray-800 leading-none mb-1 truncate">{student.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold">{student.xp} XP</p>
                  </div>
                  <Star className="text-amber-400 fill-amber-400 shrink-0" size={14} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">وقت المراجعة</p>
              <h4 className="text-2xl md:text-3xl font-black tracking-tight">04:15 <span className="text-[10px] text-gray-600">ساعة</span></h4>
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-blue-600 border-t-gray-800 flex items-center justify-center font-black text-[10px] shrink-0">75%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
