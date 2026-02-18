
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  MessageSquare, 
  Trash2, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Settings, 
  AlertTriangle, 
  Radio,
  Ban,
  UserPlus,
  Send,
  Zap,
  Globe,
  Lock,
  Terminal,
  Cpu,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { Post, UserState, Summary } from '../types';
import { SUMMARIES_DATA } from '../constants';
import { audioService } from '../services/audioService';
import { geminiService } from '../services/geminiService';

interface AdminPanelProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
  onBroadcast?: (message: string | null) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, posts, onPostUpdate, onBroadcast }) => {
  const [activeView, setActiveView] = useState<'stats' | 'users' | 'summaries' | 'posts' | 'settings'>('stats');
  const [broadcastInput, setBroadcastInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // API Key Settings State
  const [apiKeyInput, setApiKeyInput] = useState(geminiService.getActiveApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        "دخول مستخدم جديد من وهران",
        "تحميل ملخص الفيزياء",
        "تحديث Gemini Cache",
        "تفاعل جديد في المجتمع",
        "استهلاك الموارد: مستقر"
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setLogs(prev => [ `${new Date().toLocaleTimeString()} - ${randomAction}`, ...prev.slice(0, 5)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: 'أحمد محمود', stream: 'علوم تجريبية', status: 'نشط' },
    { id: 2, name: 'ليلى بن عودة', stream: 'رياضيات', status: 'نشط' },
    { id: 3, name: 'سفيان دراجي', stream: 'تقني رياضي', status: 'محظور' },
  ]);

  const handleBroadcast = () => {
    if (onBroadcast) {
      onBroadcast(broadcastInput || null);
      if (broadcastInput) audioService.playSuccess();
      setBroadcastInput('');
    }
  };

  const handleSaveApiKey = () => {
    setIsSavingKey(true);
    audioService.playClick();
    setTimeout(() => {
      geminiService.setApiKeyOverride(apiKeyInput);
      setIsSavingKey(false);
      audioService.playSuccess();
      alert('تم تحديث مفتاح Gemini API بنجاح.');
    }, 800);
  };

  const resetApiKey = () => {
    if (confirm('هل تريد العودة للمفتاح الافتراضي؟')) {
      setApiKeyInput('');
      geminiService.setApiKeyOverride('');
      audioService.playSuccess();
    }
  };

  const toggleUserStatus = (id: number) => {
    setMockUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'نشط' ? 'محظور' : 'نشط' } : u));
    audioService.playClick();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] text-slate-300 font-['Cairo'] overflow-hidden select-none" dir="rtl">
      
      {/* Mobile-Friendly Admin Header */}
      <header className="px-4 md:px-10 py-5 bg-slate-900/80 backdrop-blur-2xl border-b border-white/5 flex flex-col gap-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck size={24} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-white leading-none mb-1">لوحة الإدارة</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">النظام نشط</span>
              </div>
            </div>
          </div>
          
          <button 
             onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
             className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Horizontal Scrollable Tabs for Mobile */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-2 px-2">
          <TabButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<Activity size={18} />} label="الرادار" />
          <TabButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={<Users size={18} />} label="الطلاب" />
          <TabButton active={activeView === 'posts'} onClick={() => setActiveView('posts')} icon={<MessageSquare size={18} />} label="الرقابة" />
          <TabButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={18} />} label="الكنترول" />
        </div>
      </header>

      {/* Main Scrollable Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-20">
        
        {activeView === 'stats' && (
          <div className="space-y-6 md:space-y-10 animate-slide-up">
            {/* Mobile-Friendly Broadcast Card */}
            <div className="bg-indigo-600 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                    <Radio size={24} className="animate-pulse" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black italic">بث إداري عاجل</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="اكتب التنبيه للطلاب..."
                    className="flex-1 bg-black/20 border border-white/20 rounded-2xl px-6 py-4 text-sm outline-none focus:bg-black/30 transition-all text-white font-bold"
                    value={broadcastInput}
                    onChange={(e) => setBroadcastInput(e.target.value)}
                  />
                  <button 
                    onClick={handleBroadcast}
                    className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    بث الآن <Send size={18} className="rotate-180" />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <StatCard label="الطلاب الجدد" value="254" color="text-emerald-400" icon={<UserPlus size={18}/>}/>
              <StatCard label="تحميلات" value="1.8k" color="text-blue-400" icon={<FileText size={18}/>}/>
              <StatCard label="نشاط AI" value="420" color="text-indigo-400" icon={<Cpu size={18}/>}/>
            </div>

            <div className="bg-slate-900/50 p-6 md:p-8 rounded-[2rem] border border-white/5">
              <h3 className="font-black text-lg mb-6 flex items-center gap-3 text-emerald-500"><Terminal size={18} /> سجل العمليات</h3>
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] md:text-xs font-mono p-3 bg-black/40 rounded-xl border border-white/5 text-slate-400 animate-in fade-in slide-in-from-right duration-300">
                    <span className="text-emerald-500/50 ml-2">></span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-6 md:space-y-10 animate-slide-up">
            {/* Phone-Optimized API Key Settings */}
            <div className="bg-slate-900 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                    <Key size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight">Gemini API Key</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">إدارة الربط الذكي</p>
                  </div>
               </div>

               <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">المفتاح النشط</label>
                    <div className="relative">
                       <input 
                          type={showApiKey ? "text" : "password"} 
                          className="w-full pr-6 pl-12 py-5 bg-black/40 border-2 border-white/5 rounded-2xl focus:border-indigo-500 outline-none transition-all font-mono text-sm text-indigo-200"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder="أدخل API Key..."
                       />
                       <button 
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                       >
                          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row gap-3">
                    <button 
                       onClick={handleSaveApiKey}
                       disabled={isSavingKey}
                       className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                       {isSavingKey ? <RefreshCw className="animate-spin" size={20} /> : <><RefreshCw size={18} /> حفظ وتطبيق</>}
                    </button>
                    <button 
                       onClick={resetApiKey}
                       className="py-4 bg-white/5 text-slate-500 rounded-2xl font-black text-sm border border-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                       استعادة الافتراضي
                    </button>
                 </div>
                 
                 <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[10px] font-bold text-indigo-300 leading-relaxed">
                   يتم تخزين المفتاح محلياً في هذا المتصفح لضمان أسرع استجابة واستمرارية في حالة فشل المفتاح الأساسي.
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-slate-900/50 p-6 md:p-8 rounded-[2.5rem] border border-white/5">
               <h3 className="font-black text-lg mb-8 flex items-center gap-3 text-white"><Settings size={18} /> خيارات النظام</h3>
               <div className="space-y-6">
                  <SettingToggle label="تفعيل التسجيل" active={true} />
                  <SettingToggle label="وضع الصيانة" active={false} />
                  <SettingToggle label="Gemini AI (Pro)" active={true} />
               </div>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="space-y-6 animate-slide-up">
            {mockUsers.map(u => (
              <div key={u.id} className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-white border border-white/10">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">{u.name}</h4>
                    <p className="text-[10px] text-slate-500">{u.stream}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`px-3 py-1 text-[9px] font-black rounded-full border ${u.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                     {u.status}
                   </span>
                   <button onClick={() => toggleUserStatus(u.id)} className="p-2 text-slate-500 hover:text-white transition-colors">
                     {u.status === 'نشط' ? <Ban size={18} /> : <CheckCircle size={18} />}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Persistent Bottom Bar for Mobile Admin */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-around items-center md:hidden z-50 pb-8">
        <NavIcon active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<Activity size={24} />} />
        <NavIcon active={activeView === 'users'} onClick={() => setActiveView('users')} icon={<Users size={24} />} />
        <NavIcon active={activeView === 'posts'} onClick={() => setActiveView('posts')} icon={<MessageSquare size={24} />} />
        <NavIcon active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Key size={24} />} />
      </nav>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => (
  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
    <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
       {icon} {label}
    </div>
    <div className={`text-2xl font-black ${color}`}>{value}</div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon} {label}
  </button>
);

const NavIcon = ({ active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg -translate-y-2' : 'text-slate-500'}`}
  >
    {icon}
  </button>
);

const SettingToggle = ({ label, active }: { label: string, active: boolean }) => {
  const [isActive, setIsActive] = useState(active);
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-slate-400 text-sm">{label}</span>
      <button 
        onClick={() => { setIsActive(!isActive); audioService.playClick(); }}
        className={`w-12 h-6 rounded-full transition-all relative ${isActive ? 'bg-emerald-500' : 'bg-slate-800'}`}
      >
         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'right-7' : 'right-1'}`}></div>
      </button>
    </div>
  );
};

export default AdminPanel;
