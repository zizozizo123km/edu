
import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Home,
  Menu,
  X,
  FileText,
  Youtube,
  Mic,
  Volume2,
  VolumeX,
  Users,
  UserCircle,
  CalendarDays,
  MessageSquare,
  Search,
  Bell,
  Flame,
  LogOut,
  BrainCircuit,
  ShieldCheck
} from 'lucide-react';
import { UserState, Post } from './types.ts';
import { INITIAL_POSTS } from './constants.tsx';
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
    black: 'bg-slate-800 text-white border-slate-700 shadow-sm'
  }[colorClass as 'blue' | 'indigo' | 'red' | 'black'] || 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm';

  const inactiveClasses = colorClass === 'black' 
    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600';

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-2xl border transition-all duration-200 group ${active ? activeClasses : `border-transparent ${inactiveClasses}`}`}
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
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminBroadcast, setAdminBroadcast] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(window.location.pathname.startsWith('/admin'));

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminMode(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleAuthComplete = (newUser: UserState) => {
    setUser(newUser);
    if (soundEnabled) audioService.playSuccess();
    // إذا كان المستخدم الجديد هو الأدمن، نتأكد من تفعيل وضع الأدمن فوراً
    if (newUser.rank === 'المشرف العام' || newUser.email === 'nacero1234@gmail.com') {
      setIsAdminMode(true);
      window.history.pushState({}, '', '/admin');
    }
  };

  const logout = () => {
    setUser(null);
    window.history.pushState({}, '', '/');
    setIsAdminMode(false);
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) audioService.playClick();
  };

  const navigateTo = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setIsAdminMode(false);
    if (soundEnabled) audioService.playClick();
  };

  if (isAdminMode) {
    return (
      <div className="h-screen w-screen bg-[#020617] overflow-hidden" dir="rtl">
        <AdminPanel 
          user={user || { name: 'المشرف العام', stream: 'علوم تجريبية', xp: 0, streak: 0, avatarSeed: 'admin', joinDate: '', rank: 'المشرف العام' }} 
          posts={posts} 
          onPostUpdate={setPosts} 
          onBroadcast={setAdminBroadcast} 
        />
        {/* زر العودة للمنصة متاح للأدمن دائماً */}
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
    return <Auth onComplete={handleAuthComplete} />;
  }

  const isChatTab = activeTab === 'streamchat';

  return (
    <div className="h-screen w-screen bg-[#FDFDFF] font-['Cairo',_sans-serif] flex text-right overflow-hidden relative pb-[env(safe-area-inset-bottom)]" dir="rtl">
      <MotivationalToast />

      {adminBroadcast && (
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-6 py-4 text-center font-black text-xs md:text-sm animate-in slide-in-from-top duration-500 shadow-2xl flex items-center justify-center gap-4 border-b border-red-400/30 backdrop-blur-md">
          <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
            <ShieldCheck size={20} />
          </div>
          <span className="flex-1 drop-shadow-sm">{adminBroadcast}</span>
          <button 
            onClick={() => { setAdminBroadcast(null); if(soundEnabled) audioService.playClick(); }} 
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border border-white/20"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 md:w-80 bg-white border-l border-gray-100 flex flex-col transition-transform duration-300 transform
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 md:p-10 flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-8 md:mb-12 shrink-0">
            <div className="flex items-center group cursor-pointer" onClick={() => navigateTo('dashboard')}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 ml-3 md:ml-4 transition-all group-hover:rotate-6 group-hover:scale-110">
                <Globe size={24} strokeWidth={3} />
              </div>
              <span className="text-xl md:text-2xl font-black text-blue-900 italic tracking-tighter shrink-0">DzairEdu <span className="text-blue-600">Pro</span></span>
            </div>
            <button className="lg:hidden p-2 text-gray-400" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
          </div>

          <nav className="space-y-1.5 flex-1">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-4 mb-3">القائمة الرئيسية</p>
            <NavItem active={activeTab === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<Home size={20} />} label="لوحة التحكم" />
            <NavItem active={activeTab === 'studyplan'} onClick={() => navigateTo('studyplan')} icon={<CalendarDays size={20} />} label="خطة الدراسة" colorClass="indigo" />
            <NavItem active={activeTab === 'streamchat'} onClick={() => navigateTo('streamchat')} icon={<MessageSquare size={20}