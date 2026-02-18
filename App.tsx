
import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  BookOpen, 
  Award, 
  BrainCircuit, 
  Search, 
  Bell, 
  Flame, 
  LogOut, 
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
  Maximize,
  Minimize,
  UserCircle,
  CalendarDays,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Settings,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { UserState, Post } from './types';
import { INITIAL_POSTS } from './constants';
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
  const [isAdminMode, setIsAdminMode] = useState(window.location.pathname === '/admin');

  // SPA Routing check for Vercel
  useEffect(() => {
    const handleLocation = () => {
      setIsAdminMode(window.location.pathname === '/admin');
    };
    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  const handleAuthComplete = (newUser: UserState) => {
    setUser(newUser);
    if (soundEnabled) audioService.playSuccess();
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
    window.history.pushState({}, '', '/');
    setIsAdminMode(false);
    if (soundEnabled) audioService.playClick();
  };

  // RENDERING ADMIN PANEL AS A SEPARATE INDEPENDENT PAGE
  if (isAdminMode) {
    return (
      <AdminPanel 
        user={user || { name: 'المشرف العام', stream: '', xp: 0, streak: 0, avatarSeed: 'admin', joinDate: '', rank: 'مشرف' }} 
        posts={posts} 
        onPostUpdate={setPosts} 
        onBroadcast={setAdminBroadcast} 
      />
    );
  }

  if (!user) {
    return <Auth onComplete={handleAuthComplete} />;
  }

  const isChatTab = activeTab === 'streamchat';

  return (
    <div className="h-screen w-screen bg-[#FDFDFF] font-['Cairo',_sans-serif] flex text-right overflow-hidden relative pb-[env(safe-area-inset-bottom)]" dir="rtl">
      
      {/* Global Motivational Toast System */}
      <MotivationalToast />

      {/* ADMIN CONTROL: GLOBAL BROADCAST BANNER (Visible to all students) */}
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

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
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
            <NavItem active={activeTab === 'streamchat'} onClick={() => navigateTo('streamchat')} icon={<MessageSquare size={20} />} label="غرفة الشعبة" colorClass="blue" />
            <NavItem active={activeTab === 'community'} onClick={() => navigateTo('community')} icon={<Users size={20} />} label="ساحة المجتمع" />
            <NavItem active={activeTab === 'videos'} onClick={() => navigateTo('videos')} icon={<Youtube size={20} />} label="دروس مرئية AI" colorClass="red" />
            <NavItem active={activeTab === 'summaries'} onClick={() => navigateTo('summaries')} icon={<FileText size={20} />} label="الملخصات" />
            
            <div className="pt-8">
               <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-4 mb-4">ميزات حصرية</p>
               <div className="space-y-2.5 px-1">
                 <button 
                   onClick={() => { setShowLiveTutor(true); setIsSidebarOpen(false); if(soundEnabled) audioService.playClick(); }}
                   className="w-full flex items-center px-4 py-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all group"
                  >
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center ml-3 shadow-sm group-hover:rotate-12 transition-transform">
                    <Mic size={18} />
                  </div>
                  <span className="font-black text-[14px]">الأستاذ المباشر</span>
                </button>
                
                <button 
                  onClick={() => { setShowAi(true); setIsSidebarOpen(false); if(soundEnabled) audioService.playClick(); }}
                  className="w-full flex items-center px-4 py-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all group"
                 >
                 <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center ml-3 shadow-sm group-hover:rotate-12 transition-transform">
                   <BrainCircuit size={18} />
                 </div>
                 <span className="font-black text-[14px]">مساعد Dzair AI</span>
                </button>
               </div>
            </div>
          </nav>

          <div className="mt-6 shrink-0 border-t border-gray-100 pt-6">
            <div 
              onClick={() => navigateTo('profile')}
              className={`flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-sm ${activeTab === 'profile' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white ml-3 shadow-lg shadow-blue-100 border-2 border-white shrink-0">
                 {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-black text-gray-800 truncate leading-none mb-1">{user.name}</p>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{user.stream}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); logout(); }} className="text-gray-300 hover:text-red-500 transition-colors p-2 shrink-0"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-40 border-b border-gray-100 px-4 md:px-8 py-3.5 md:py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"><Menu size={22} /></button>
            <div className="text-lg md:text-xl font-black text-blue-900 italic tracking-tighter">DzairEdu <span className="text-blue-600">Pro</span></div>
          </div>
          
          <div className="hidden lg:flex flex-1 max-w-2xl mx-4">
            <div className="relative group w-full">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن دروس، ملخصات، أو تمارين البكالوريا..." 
                className="w-full pr-12 pl-6 py-2.5 bg-gray-50/80 border border-transparent focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50 rounded-2xl text-[14px] outline-none font-bold transition-all shadow-inner" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 items-center gap-2 shadow-sm">
              <Flame size={18} className="text-orange-500" />
              <span className="text-xs font-black text-orange-700">{user.streak} أيام</span>
            </div>

            <button 
              onClick={toggleSound}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-xl border flex items-center justify-center transition-all ${soundEnabled ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            
            <button className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 relative hover:text-blue-600 transition-all group">
               <Bell size={20} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm group-hover:scale-125 transition-transform"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${isChatTab ? 'p-0 pb-20 lg:pb-0' : 'p-4 md:p-10 pb-28 md:pb-32'}`}>
          <div className={`h-full ${isChatTab ? 'w-full max-w-none' : 'max-w-7xl mx-auto'}`}>
            {activeTab === 'dashboard' && <Dashboard user={user} posts={posts} onPostUpdate={setPosts} />}
            {activeTab === 'profile' && <Profile user={user} />}
            {activeTab === 'community' && <Community user={user} posts={posts} onPostUpdate={setPosts} />}
            {activeTab === 'summaries' && <Summaries user={user} soundEnabled={soundEnabled} />}
            {activeTab === 'videos' && <VideoLessons />}
            {activeTab === 'studyplan' && <StudyPlan user={user} />}
            {activeTab === 'streamchat' && <StreamChat user={user} />}
          </div>
        </main>

        {/* Floating Action Buttons */}
        {!showAi && !showLiveTutor && !isChatTab && (
          <div className="fixed bottom-24 right-4 md:bottom-12 md:left-12 flex flex-col gap-3 lg:gap-4 z-40">
            <button 
              onClick={() => { setShowLiveTutor(true); if(soundEnabled) audioService.playClick(); }}
              className="bg-indigo-600 text-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all group border-2 border-white"
            >
              <Mic size={24} className="md:w-8 md:h-8" />
            </button>
            <button 
              onClick={() => { setShowAi(true); if(soundEnabled) audioService.playClick(); }}
              className="bg-blue-600 text-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all group border-2 border-white"
            >
              <BrainCircuit size={24} className="md:w-8 md:h-8" />
            </button>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-8">
          <button onClick={() => navigateTo('dashboard')} className={`p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}><Home size={24} /></button>
          <button onClick={() => navigateTo('streamchat')} className={`p-2 ${activeTab === 'streamchat' ? 'text-blue-600' : 'text-gray-400'}`}><MessageSquare size={24} /></button>
          <button onClick={() => setShowAi(true)} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg -translate-y-4 border-4 border-white"><BrainCircuit size={24} /></button>
          <button onClick={() => navigateTo('community')} className={`p-2 ${activeTab === 'community' ? 'text-blue-600' : 'text-gray-400'}`}><Users size={24} /></button>
          <button onClick={() => navigateTo('profile')} className={`p-2 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}><UserCircle size={24} /></button>
        </nav>

        {showAi && <AiAssistant user={user} onClose={() => setShowAi(false)} />}
        {showLiveTutor && <LiveTutor userName={user.name} onClose={() => setShowLiveTutor(false)} />}
      </div>
    </div>
  );
};

export default App;
