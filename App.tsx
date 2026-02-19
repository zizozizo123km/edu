
import React, { useState, useEffect } from 'react';
import { 
  Globe, Home, Menu, X, FileText, Youtube, Mic, Volume2, VolumeX, 
  Users, UserCircle, CalendarDays, MessageSquare, Search, Bell, 
  Flame, LogOut, BrainCircuit, ShieldCheck, Phone
} from 'lucide-react';
import { UserState, Post } from './types.ts';
import { auth, db } from './services/firebaseService';
import { onAuthStateChanged, signOut } from "https://esm.sh/firebase@10.8.0/auth";
import { ref, onValue, off } from "https://esm.sh/firebase@10.8.0/database";

import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import AiAssistant from './components/AiAssistant.tsx';
import Summaries from './components/Summaries.tsx';
import VideoLessons from './components/VideoLessons.tsx';
import LiveTutor from './components/LiveTutor.tsx';
import Community from './components/Community.tsx';
import Profile from './components/Profile.tsx';
import StudyPlan from './components/StudyPlan.tsx';
import MotivationalToast from './components/MotivationalToast.tsx';
import StreamChat from './components/StreamChat.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { audioService } from './services/audioService.ts';

const NavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  colorClass?: string;
}> = ({ active, onClick, icon, label, colorClass = 'blue' }) => {
  const activeClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm',
    red: 'bg-red-50 text-red-600 border-red-200 shadow-sm',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm',
    black: 'bg-slate-800 text-white border-slate-700 shadow-sm'
  }[colorClass as any] || 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm';

  return (
    <button onClick={onClick} className={`w-full flex items-center px-4 py-3 rounded-2xl border transition-all duration-200 group ${active ? activeClasses : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}>
      <div className={`ml-3 transition-transform group-hover:rotate-6 ${active ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>{icon}</div>
      <span className="font-black text-[14px]">{label}</span>
    </button>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'summaries' | 'videos' | 'community' | 'profile' | 'studyplan' | 'streamchat'>('dashboard');
  const [showAi, setShowAi] = useState(false);
  const [showLiveTutor, setShowLiveTutor] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminBroadcast, setAdminBroadcast] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.val());
          }
        });
      } else {
        setUser(null);
      }
    });

    const postsRef = ref(db, 'posts');
    onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray = Object.keys(data).map(key => ({ ...data[key], id: key })).reverse();
        setPosts(postsArray);
      }
    });

    return () => {
      unsubscribe();
      off(postsRef);
    };
  }, []);

  const logout = () => {
    signOut(auth);
    setUser(null);
    window.history.pushState({}, '', '/');
  };

  const navigateTo = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (soundEnabled) audioService.playClick();
  };

  if (!user) return <Auth onComplete={setUser} />;

  return (
    <div className="h-screen w-screen bg-[#FDFDFF] font-['Cairo'] flex text-right overflow-hidden relative" dir="rtl">
      <MotivationalToast />
      {adminBroadcast && (
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-red-600 text-white p-4 text-center font-black animate-slide-up">
          {adminBroadcast} <button onClick={() => setAdminBroadcast(null)} className="mr-4 underline">إغلاق</button>
        </div>
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-100 flex flex-col transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className="flex items-center group cursor-pointer mb-12" onClick={() => navigateTo('dashboard')}>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl ml-4"><Globe size={24} strokeWidth={3} /></div>
            <span className="text-2xl font-black text-blue-900 italic">DzairEdu <span className="text-blue-600">Pro</span></span>
          </div>

          <nav className="space-y-1.5 flex-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<Home size={20} />} label="لوحة التحكم" />
            <NavItem active={activeTab === 'studyplan'} onClick={() => navigateTo('studyplan')} icon={<CalendarDays size={20} />} label="خطة الدراسة" colorClass="indigo" />
            <NavItem active={activeTab === 'streamchat'} onClick={() => navigateTo('streamchat')} icon={<MessageSquare size={20} />} label="دردشة الشعبة" colorClass="blue" />
            <NavItem active={activeTab === 'community'} onClick={() => navigateTo('community')} icon={<Users size={20} />} label="ساحة المجتمع" />
            <NavItem active={activeTab === 'videos'} onClick={() => navigateTo('videos')} icon={<Youtube size={20} />} label="دروس مرئية AI" colorClass="red" />
            <NavItem active={activeTab === 'summaries'} onClick={() => navigateTo('summaries')} icon={<FileText size={20} />} label="الملخصات" />
            
            <button onClick={() => { setShowLiveTutor(true); setIsSidebarOpen(false); }} className="w-full mt-6 flex items-center px-4 py-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg group">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center ml-3"><Phone size={18} /></div>
              <span className="font-black text-[14px]">الأستاذ المباشر</span>
            </button>
          </nav>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div onClick={() => navigateTo('profile')} className={`flex items-center p-3.5 rounded-2xl border bg-gray-50 border-gray-100 cursor-pointer hover:bg-gray-100`}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white ml-3 shadow-lg">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} className="w-full h-full rounded-xl" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-black text-gray-800 truncate">{user.name}</p>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{user.rank}</p>
              </div>
              <button onClick={logout} className="text-gray-300 hover:text-red-500 p-2"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-8 py-5 flex justify-between items-center z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-gray-50 rounded-xl"><Menu size={22} /></button>
          <div className="text-xl font-black text-blue-900">DzairEdu <span className="text-blue-600">Pro</span></div>
          <div className="flex items-center gap-3">
             <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 items-center gap-2 flex"><Flame size={18} className="text-orange-500" /><span className="text-xs font-black text-orange-700">{user.streak} أيام</span></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-32">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard user={user} posts={posts} onPostUpdate={() => {}} />}
            {activeTab === 'profile' && <Profile user={user} />}
            {activeTab === 'community' && <Community user={user} posts={posts} onPostUpdate={() => {}} />}
            {activeTab === 'summaries' && <Summaries user={user} soundEnabled={soundEnabled} />}
            {activeTab === 'videos' && <VideoLessons />}
            {activeTab === 'studyplan' && <StudyPlan user={user} />}
            {activeTab === 'streamchat' && <StreamChat user={user} />}
          </div>
        </main>

        <button onClick={() => setShowAi(true)} className="fixed bottom-12 left-12 bg-blue-600 text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 transition-all z-40">
           <BrainCircuit size={32} />
        </button>

        {showAi && <AiAssistant user={user} onClose={() => setShowAi(false)} />}
        {showLiveTutor && <LiveTutor userName={user.name} onClose={() => setShowLiveTutor(false)} />}
      </div>
    </div>
  );
};

export default App;
