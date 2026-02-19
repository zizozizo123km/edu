
import React, { useState, useEffect } from 'react';
import { 
  Globe, Home, Menu, X, FileText, Youtube, Mic, Volume2, VolumeX, 
  Users, UserCircle, CalendarDays, MessageSquare, Search, Bell, 
  Flame, LogOut, BrainCircuit, ShieldCheck 
} from 'lucide-react';
import { UserState, Post } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AiAssistant from './components/AiAssistant';
import Summaries from './components/Summaries';
import VideoLessons from './components/VideoLessons';
import LiveTutor from './components/LiveTutor';
import Community from './components/Community';
import Profile from './components/Profile';
import StudyPlan from './components/StudyPlan';
import MotivationalToast from './components/MotivationalToast';
import StreamChat from './components/StreamChat';
import AdminPanel from './components/AdminPanel';
import { audioService } from './services/audioService';
import { db, auth } from './services/firebaseService';
import { ref, onValue, off } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
    black: 'bg-slate-800 text-white border-slate-700 shadow-sm'
  }[colorClass as 'blue' | 'indigo' | 'red' | 'black'] || 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm';

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-2xl border transition-all duration-200 group ${active ? activeClasses : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}
    >
      <div className={`ml-3 transition-transform group-hover:rotate-6 ${active ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
        {icon}
      </div>
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
    // مراقبة حالة تسجيل الدخول
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser(userData);
            if (userData.email === 'nacero1234@gmail.com') {
              setIsAdminMode(window.location.pathname.startsWith('/admin'));
            }
          }
        });
      } else {
        setUser(null);
        setIsAdminMode(false);
      }
    });

    // جلب المنشورات من قاعدة البيانات
    const postsRef = ref(db, 'posts');
    onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).reverse();
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    });

    return () => {
      unsubscribeAuth();
      off(postsRef);
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    window.history.pushState({}, '', '/');
    setIsAdminMode(false);
  };

  const navigateTo = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (soundEnabled) audioService.playClick();
  };

  if (isAdminMode && user?.email === 'nacero1234@gmail.com') {
    return (
      <div className="h-screen w-screen bg-[#020617] overflow-hidden" dir="rtl">
        <AdminPanel user={user} posts={posts} onPostUpdate={() => {}} onBroadcast={setAdminBroadcast} />
        <button 
           onClick={() => { window.history.pushState({}, '', '/'); setIsAdminMode(false); }}
           className="fixed bottom-6 left-6 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/10 text-xs font-black transition-all z-[1000] backdrop-blur-md"
        >
          الخروج من لوحة التحكم
        </button>
      </div>
    );
  }

  if (!user) {
    return <Auth onComplete={() => {}} />;
  }

  return (
    <div className="h-screen w-screen bg-[#FDFDFF] font-['Cairo',_sans-serif] flex text-right overflow-hidden relative" dir="rtl">
      <MotivationalToast />
      {adminBroadcast && (
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-red-600 text-white px-6 py-4 text-center font-black animate-slide-up shadow-2xl">
          {adminBroadcast} <button onClick={() => setAdminBroadcast(null)} className="mr-4 underline">إغلاق</button>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 md:w-80 bg-white border-l border-gray-100 flex flex-col transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-10 flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center group cursor-pointer" onClick={() => navigateTo('dashboard')}>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl ml-4">
                <Globe size={24} strokeWidth={3} />
              </div>
              <span className="text-2xl font-black text-blue-900 italic">DzairEdu <span className="text-blue-600">Pro</span></span>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<Home size={20} />} label="لوحة التحكم" />
            <NavItem active={activeTab === 'studyplan'} onClick={() => navigateTo('studyplan')} icon={<CalendarDays size={20} />} label="خطة الدراسة" colorClass="indigo" />
            <NavItem active={activeTab === 'streamchat'} onClick={() => navigateTo('streamchat')} icon={<MessageSquare size={20} />} label="غرفة الشعبة" colorClass="blue" />
            <NavItem active={activeTab === 'community'} onClick={() => navigateTo('community')} icon={<Users size={20} />} label="ساحة المجتمع" />
            <NavItem active={activeTab === 'videos'} onClick={() => navigateTo('videos')} icon={<Youtube size={20} />} label="دروس مرئية AI" colorClass="red" />
            <NavItem active={activeTab === 'summaries'} onClick={() => navigateTo('summaries')} icon={<FileText size={20} />} label="الملخصات" />
          </nav>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div onClick={() => navigateTo('profile')} className="flex items-center p-3.5 rounded-2xl border bg-gray-50 border-gray-100 cursor-pointer hover:bg-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white ml-3 shrink-0">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}`} className="w-full h-full rounded-xl" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-black text-gray-800 truncate">{user.name}</p>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{user.rank}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); logout(); }} className="text-gray-300 hover:text-red-500 p-2"><LogOut size={18} /></button>
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
        
        <div className="fixed bottom-12 left-12 flex flex-col gap-4 z-40">
           <button onClick={() => setShowAi(true)} className="bg-blue-600 text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all"><BrainCircuit size={32} /></button>
        </div>

        {showAi && <AiAssistant user={user} onClose={() => setShowAi(false)} />}
        {showLiveTutor && <LiveTutor userName={user.name} onClose={() => setShowLiveTutor(false)} />}
      </div>
    </div>
  );
};

export default App;
