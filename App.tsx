
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
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from './services/firebase.ts';
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
import { geminiService } from './services/geminiService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'summaries' | 'videos' | 'community' | 'profile' | 'studyplan' | 'streamchat'>('dashboard');
  const [showAi, setShowAi] = useState(false);
  const [showLiveTutor, setShowLiveTutor] = useState(false);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminBroadcast, setAdminBroadcast] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // 1. الاستماع لمفتاح API من قاعدة البيانات
    const configRef = ref(db, 'admin_config/gemini_api_key');
    const unsubConfig = onValue(configRef, (snap) => {
      const key = snap.val();
      if (key) {
        geminiService.setDynamicApiKey(key);
        console.log("Gemini API Key Synced from DB");
      }
    });

    // 2. الاستماع لإعلانات المشرف
    const broadcastRef = ref(db, 'broadcasts/current');
    const unsubBroadcast = onValue(broadcastRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.message) {
        setAdminBroadcast(data.message);
        if (soundEnabled) audioService.playSuccess();
      }
    });

    // 3. إدارة حالة المصادقة
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = firebaseUser.email?.trim().toLowerCase() === 'nacero1234@gmail.com';
        const loggedUser: UserState = {
          uid: firebaseUser.uid,
          name: isAdmin ? 'المشرف العام' : (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'طالب'),
          email: firebaseUser.email || '',
          stream: 'علوم تجريبية',
          xp: isAdmin ? 99999 : 2450,
          streak: isAdmin ? 365 : 7,
          avatarSeed: isAdmin ? 'admin' : firebaseUser.uid,
          joinDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
          rank: isAdmin ? 'المشرف العام' : 'طالب متميز'
        };
        setUser(loggedUser);
        if (isAdmin) setIsAdminMode(true);
      } else {
        if (user?.email !== 'nacero1234@gmail.com') {
           setUser(null);
           setIsAdminMode(false);
        }
      }
      setIsAuthLoading(false);
    });
    
    return () => {
      unsubAuth();
      unsubBroadcast();
      unsubConfig();
    };
  }, [user?.email, soundEnabled]);

  const handleAuthComplete = (newUser: UserState) => {
    setUser(newUser);
    if (soundEnabled) audioService.playSuccess();
    if (newUser.email?.trim().toLowerCase() === 'nacero1234@gmail.com') {
      setIsAdminMode(true);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
    setIsAdminMode(false);
    if (soundEnabled) audioService.playClick();
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FDFDFF]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // وضع المشرف
  if (user?.email?.trim().toLowerCase() === 'nacero1234@gmail.com') {
    return (
      <div className="h-screen w-screen bg-[#020617] overflow-hidden" dir="rtl">
        <AdminPanel 
          user={user} 
          posts={posts} 
          onPostUpdate={setPosts} 
          onBroadcast={setAdminBroadcast} 
        />
        <button 
           onClick={logout}
           className="fixed bottom-6 left-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-2xl font-black text-xs transition-all z-[1000] border border-white/10"
        >
          خروج المسؤول
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
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 text-center font-black text-xs md:text-sm animate-in slide-in-from-top duration-500 shadow-2xl flex items-center justify-center gap-4">
          <ShieldCheck size={20} className="animate-pulse" />
          <span>تنبيه إداري: {adminBroadcast}</span>
          <button onClick={() => setAdminBroadcast(null)} className="p-1.5 hover:bg-white/10 rounded-lg border border-white/20"><X size={16} /></button>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-100 flex flex-col transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center group cursor-pointer" onClick={() => navigateTo('dashboard')}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl ml-3">
                <Globe size={24} />
              </div>
              <span className="text-xl font-black text-blue-900 italic">DzairEdu <span className="text-blue-600">Pro</span></span>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => navigateTo('dashboard')} icon={<Home size={20} />} label="لوحة التحكم" />
            <NavItem active={activeTab === 'streamchat'} onClick={() => navigateTo('streamchat')} icon={<MessageSquare size={20} />} label="غرفة الشعبة" />
            <NavItem active={activeTab === 'community'} onClick={() => navigateTo('community')} icon={<Users size={20} />} label="ساحة المجتمع" />
            <NavItem active={activeTab === 'videos'} onClick={() => navigateTo('videos')} icon={<Youtube size={20} />} label="دروس مرئية" colorClass="red" />
            <NavItem active={activeTab === 'summaries'} onClick={() => navigateTo('summaries')} icon={<FileText size={20} />} label="الملخصات" />
          </nav>

          <div className="mt-6 border-t pt-6">
            <div onClick={() => navigateTo('profile')} className="flex items-center p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white ml-3">{user.name.charAt(0)}</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-gray-800 truncate">{user.name}</p>
                <p className="text-[10px] text-blue-600 font-black">{user.rank}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); logout(); }} className="p-2 text-gray-400 hover:text-red-500"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-40 border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-gray-50 rounded-xl"><Menu size={22} /></button>
          <div className="text-lg font-black text-blue-900">DzairEdu <span className="text-blue-600">Pro</span></div>
          <div className="flex items-center gap-3">
            <button onClick={toggleSound} className={`w-10 h-10 rounded-xl border flex items-center justify-center ${soundEnabled ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto ${isChatTab ? 'p-0' : 'p-6 md:p-10 pb-28'}`}>
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard user={user} posts={posts} onPostUpdate={setPosts} />}
            {activeTab === 'profile' && <Profile user={user} />}
            {activeTab === 'community' && <Community user={user} posts={posts} onPostUpdate={setPosts} />}
            {activeTab === 'summaries' && <Summaries user={user} soundEnabled={soundEnabled} />}
            {activeTab === 'videos' && <VideoLessons />}
            {activeTab === 'studyplan' && <StudyPlan user={user} />}
            {activeTab === 'streamchat' && <StreamChat user={user} />}
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex justify-between items-center z-50 pb-8">
          <button onClick={() => navigateTo('dashboard')} className={`p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}><Home size={24} /></button>
          <button onClick={() => setShowAi(true)} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg -translate-y-4"><BrainCircuit size={24} /></button>
          <button onClick={() => navigateTo('profile')} className={`p-2 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}><UserCircle size={24} /></button>
        </nav>

        {showAi && <AiAssistant user={user} onClose={() => setShowAi(false)} />}
        {showLiveTutor && <LiveTutor userName={user.name} onClose={() => setShowLiveTutor(false)} />}
      </div>
    </div>
  );
};

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: any, label: string, colorClass?: string}> = ({active, onClick, icon, label, colorClass = 'blue'}) => (
  <button onClick={onClick} className={`w-full flex items-center px-4 py-3 rounded-2xl border transition-all ${active ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
    <div className="ml-3">{icon}</div>
    <span className="font-black text-sm">{label}</span>
  </button>
);

export default App;
