
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
  Server,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Radio,
  Ban,
  UserPlus,
  Send,
  Zap,
  Globe,
  Lock,
  Terminal,
  Cpu,
  Database,
  Key,
  RefreshCw,
  EyeOff
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
  const [summaries, setSummaries] = useState<Summary[]>(SUMMARIES_DATA);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // API Key Settings State
  const [apiKeyInput, setApiKeyInput] = useState(geminiService.getActiveApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        "دخول مستخدم جديد من ولاية وهران",
        "تحميل ملخص الفيزياء (بوالريش)",
        "تحديث ذاكرة التخزين المؤقت لـ Gemini",
        "تفاعلات جديدة في ساحة المجتمع",
        "مراقبة استهلاك الموارد - حالة مستقرة"
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setLogs(prev => [ `${new Date().toLocaleTimeString()} - ${randomAction}`, ...prev.slice(0, 5)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: 'أحمد محمود', stream: 'علوم تجريبية', status: 'نشط', rank: 'طالب متميز' },
    { id: 2, name: 'ليلى بن عودة', stream: 'رياضيات', status: 'نشط', rank: 'طالب مجتهد' },
    { id: 3, name: 'سفيان دراجي', stream: 'تقني رياضي', status: 'محظور', rank: 'طالب' },
    { id: 4, name: 'مريم جبار', stream: 'لغات أجنبية', status: 'نشط', rank: 'طالب متميز' },
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
      alert('تم تحديث مفتاح Gemini API بنجاح لجميع أدوات التطبيق.');
    }, 800);
  };

  const resetApiKey = () => {
    if (confirm('هل أنت متأكد من العودة للمفتاح الافتراضي في ملف البيئة؟')) {
      setApiKeyInput('');
      geminiService.setApiKeyOverride('');
      audioService.playSuccess();
    }
  };

  const deletePost = (id: number) => {
    onPostUpdate(posts.filter(p => p.id !== id));
    audioService.playClick();
  };

  const toggleUserStatus = (id: number) => {
    setMockUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'نشط' ? 'محظور' : 'نشط' } : u));
    audioService.playClick();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] text-slate-300 animate-slide-up overflow-hidden">
      
      {/* Admin Header */}
      <div className="px-6 md:px-10 py-6 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">مركز التحكم المركزي <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-md animate-pulse">LIVE</span></h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">نظام DzairEdu Pro الإداري v2.5</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <TabButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<Activity size={18} />} label="الرادار" />
          <TabButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={<Users size={18} />} label="الطلاب" />
          <TabButton active={activeView === 'summaries'} onClick={() => setActiveView('summaries')} icon={<FileText size={18} />} label="المحتوى" />
          <TabButton active={activeView === 'posts'} onClick={() => setActiveView('posts')} icon={<MessageSquare size={18} />} label="الرقابة" />
          <TabButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={18} />} label="الكنترول" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        
        {activeView === 'stats' && (
          <div className="space-y-10">
            {/* Live Broadcast Control */}
            <div className="bg-gradient-to-br from-indigo-900/60 to-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="shrink-0 w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Radio size={40} className="animate-pulse" />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-2xl font-black text-white mb-2 italic">نظام البث الإداري (Command Broadcast)</h3>
                    <p className="text-slate-400 text-xs font-bold mb-6 tracking-wide">أرسل رسالة عاجلة ستظهر كشريط علوي لجميع الطلاب في الوقت الفعلي.</p>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="اكتب التنبيه (مثال: هام! تم رفع مواضيع البكالوريا التجريبية 2025)..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-600"
                        value={broadcastInput}
                        onChange={(e) => setBroadcastInput(e.target.value)}
                      />
                      <button 
                        onClick={handleBroadcast}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 transition-all active:scale-95"
                      >
                        إطلاق البث <Send size={18} className="rotate-180" />
                      </button>
                    </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <StatCard label="الطلاب الجدد" value="254" color="text-emerald-400" icon={<UserPlus size={18}/>}/>
                  <StatCard label="ملفات مرفوعة" value="86" color="text-blue-400" icon={<FileText size={18}/>}/>
                  <StatCard label="نشاط الذكاء الاصطناعي" value="4.2k" color="text-indigo-400" icon={<Cpu size={18}/>}/>
                </div>
                
                <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 min-h-[400px]">
                   <h3 className="font-black text-xl mb-10 flex items-center gap-3"><Activity className="text-blue-500" /> تحليل النشاط اللحظي</h3>
                   <div className="h-64 flex items-end justify-between gap-3 px-4">
                      {[40, 70, 45, 90, 65, 80, 55, 60, 40, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group">
                          <div className="absolute bottom-0 w-full bg-indigo-500/30 rounded-t-xl transition-all duration-1000 group-hover:bg-indigo-500" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 p-8 rounded-[3rem] flex flex-col">
                 <h3 className="font-black text-lg mb-8 flex items-center gap-3 text-emerald-500"><Terminal size={20} /> سجلات النظام (Logs)</h3>
                 <div className="space-y-4 flex-1">
                    {logs.map((log, i) => (
                      <div key={i} className="text-[10px] font-mono p-3 bg-white/5 rounded-xl border border-white/5 text-slate-400 animate-in fade-in slide-in-from-right duration-300">
                        {log}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-slide-up">
              <div className="lg:col-span-2 space-y-10">
                {/* Gemini API Key Configuration Section */}
                <div className="bg-slate-900/80 p-10 rounded-[3.5rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                            <Key size={28} />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-white">إعدادات Gemini API</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">تحديث المفتاح لجميع أدوات المساعد الذكي</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">مفتاح API الحالي</label>
                            <div className="relative group">
                               <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400">
                                  <Lock size={20} />
                               </div>
                               <input 
                                  type={showApiKey ? "text" : "password"} 
                                  className="w-full pr-14 pl-14 py-5 bg-black/40 border-2 border-white/5 rounded-3xl focus:border-indigo-500 outline-none transition-all font-mono text-sm text-indigo-200"
                                  value={apiKeyInput}
                                  onChange={(e) => setApiKeyInput(e.target.value)}
                                  placeholder="أدخل مفتاح Gemini API هنا..."
                               />
                               <button 
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                               >
                                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                               </button>
                            </div>
                         </div>

                         <div className="flex gap-4 pt-4">
                            <button 
                               onClick={handleSaveApiKey}
                               disabled={isSavingKey}
                               className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                               {isSavingKey ? <Loader2 size={20} className="animate-spin" /> : <><RefreshCw size={20} /> حفظ وتطبيق المفتاح الجديد</>}
                            </button>
                            <button 
                               onClick={resetApiKey}
                               className="px-8 py-5 bg-white/5 text-slate-400 rounded-3xl font-black text-sm border border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                            >
                               إعادة تعيين
                            </button>
                         </div>
                         
                         <p className="text-[10px] text-slate-500 font-medium italic mt-4">
                           * ملاحظة: هذا المفتاح سيتم تخزينه محلياً في متصفحك وسيكون له الأولوية على المفتاح المدمج في الكود.
                         </p>
                      </div>
                   </div>
                   <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border border-white/5">
                   <h3 className="font-black text-xl mb-10 flex items-center gap-3 text-white"><Settings className="text-slate-500" /> تفضيلات النظام</h3>
                   <div className="space-y-8">
                      <SettingToggle label="تفعيل التسجيل الجديد" active={true} />
                      <SettingToggle label="وضع الصيانة الفوري" active={false} />
                      <SettingToggle label="مساعد الذكاء الاصطناعي (Pro)" active={true} />
                      <SettingToggle label="السماح بالتعليقات العامة" active={true} />
                   </div>
                </div>
              </div>

              <div className="space-y-10">
                 <div className="bg-slate-950 p-10 rounded-[3.5rem] border border-red-900/20 flex flex-col justify-center items-center text-center">
                    <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
                       <Lock size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4">بروتوكول الطوارئ</h3>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">هذا الإجراء سيقوم بتصفير السجلات وإعادة تشغيل محرك الربط.</p>
                    <button className="w-full py-4 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all">إعادة تهيئة النظام</button>
                 </div>
              </div>
           </div>
        )}

        {activeView === 'users' && (
          <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-xl text-white">إدارة حسابات الطلاب</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-black/20 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">الطالب</th>
                    <th className="px-8 py-5">الشعبة</th>
                    <th className="px-8 py-5">الحالة</th>
                    <th className="px-8 py-5">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5 font-bold text-white">{u.name}</td>
                      <td className="px-8 py-5 text-sm text-slate-400">{u.stream}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${u.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <button onClick={() => toggleUserStatus(u.id)} className={`p-2 transition-colors ${u.status === 'نشط' ? 'text-slate-500 hover:text-red-500' : 'text-red-500 hover:text-emerald-500'}`}>
                          {u.status === 'نشط' ? <Ban size={18} /> : <CheckCircle size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ... Rest of the components (StatCard, TabButton, SettingToggle, etc.)
const StatCard = ({ label, value, color, icon }: any) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all">
    <div className="flex items-center gap-3 mb-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
       {icon} {label}
    </div>
    <div className={`text-3xl font-black ${color}`}>{value}</div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
      active ? 'bg-white/10 text-white shadow-lg border border-white/20' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

const SettingToggle = ({ label, active }: { label: string, active: boolean }) => {
  const [isActive, setIsActive] = useState(active);
  return (
    <div className="flex items-center justify-between p-2">
      <span className="font-bold text-slate-300 text-sm">{label}</span>
      <button 
        onClick={() => { setIsActive(!isActive); audioService.playClick(); }}
        className={`w-14 h-8 rounded-full transition-all relative ${isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`}
      >
         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isActive ? 'right-7' : 'right-1'}`}></div>
      </button>
    </div>
  );
};

const Loader2 = ({ size, className }: { size: number, className: string }) => (
  <RefreshCw size={size} className={className} />
);

export default AdminPanel;
