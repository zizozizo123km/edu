
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  MessageSquare, 
  Trash2, 
  Activity, 
  Settings, 
  Radio,
  Send,
  Zap,
  Terminal,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
  PlusCircle,
  Save
} from 'lucide-react';
import { ref, onValue, remove, set, serverTimestamp, push } from "firebase/database";
import { db } from '../services/firebase.ts';
import { Post, UserState, StreamType } from '../types';
import { audioService } from '../services/audioService';
import { geminiService } from '../services/geminiService';
import { STREAM_SUBJECTS } from '../constants';

interface AdminPanelProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
  onBroadcast?: (message: string | null) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, posts, onBroadcast }) => {
  const [activeView, setActiveView] = useState<'stats' | 'users' | 'summaries' | 'posts' | 'settings'>('stats');
  const [broadcastInput, setBroadcastInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allSummaries, setAllSummaries] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, summaries: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  const [apiKeyInput, setApiKeyInput] = useState(geminiService.getActiveApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  const [newSummary, setNewSummary] = useState({
    title: '',
    subject: 'الرياضيات',
    author: 'المشرف العام',
    url: '',
    streams: ['علوم تجريبية'] as StreamType[]
  });

  useEffect(() => {
    // التحقق من صحة المستخدم كونه المشرف
    if (user.email !== 'nacero1234@gmail.com') return;

    const usersRef = ref(db, 'users');
    const postsRef = ref(db, 'community_posts');
    const summariesRef = ref(db, 'summaries');
    const configRef = ref(db, 'admin_config/gemini_api_key');

    const unsubConfig = onValue(configRef, (snap) => {
      const key = snap.val();
      if (key) {
        setApiKeyInput(key);
        geminiService.setDynamicApiKey(key);
      }
    }, (err) => console.error("Admin Config Error:", err));

    const unsubUsers = onValue(usersRef, (snap) => {
      const data = snap.val();
      const list = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
      setAllUsers(list);
      setStats(prev => ({ ...prev, users: list.length }));
    }, (err) => setLogs(prev => [`Error: فشل الوصول لقائمة الطلاب`, ...prev]));

    const unsubPosts = onValue(postsRef, (snap) => {
      const data = snap.val();
      const list = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
      setAllPosts(list);
      setStats(prev => ({ ...prev, posts: list.length }));
    }, (err) => console.error("Posts Error:", err));

    const unsubSummaries = onValue(summariesRef, (snap) => {
      const data = snap.val();
      const list = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
      setAllSummaries(list);
      setStats(prev => ({ ...prev, summaries: list.length }));
    }, (err) => console.error("Summaries Error:", err));

    setLogs([`${new Date().toLocaleTimeString()} - تم تفعيل نظام التحكم المطلق`]);

    return () => {
      unsubUsers();
      unsubPosts();
      unsubSummaries();
      unsubConfig();
    };
  }, [user.email]);

  const handleAddSummary = async () => {
    if (!newSummary.title || !newSummary.url) return alert("يرجى ملء جميع الحقول");
    setIsLoading(true);
    try {
      const summariesRef = ref(db, 'summaries');
      const data = {
        ...newSummary,
        downloads: 0,
        rating: 5.0,
        uploadDate: new Date().toISOString(),
        icon: '📄',
        color: 'bg-indigo-600',
        fileSize: 'رابط خارجي'
      };
      await push(summariesRef, data);
      setNewSummary({ title: '', subject: 'الرياضيات', author: 'المشرف العام', url: '', streams: ['علوم تجريبية'] });
      audioService.playSuccess();
      setLogs(prev => [`${new Date().toLocaleTimeString()} - تم إضافة ملخص جديد: ${data.title}`, ...prev]);
    } catch (err) {
      alert("خطأ في الإضافة: تأكد من صلاحيات قاعدة البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSummary = async (id: string) => {
    if (window.confirm("حذف هذا الملخص نهائياً؟")) {
      try {
        await remove(ref(db, `summaries/${id}`));
        audioService.playSuccess();
      } catch (err) {
        alert("فشل الحذف: قد لا تملك الصلاحيات الكافية");
      }
    }
  };

  const handleSaveApiKeyToDB = async () => {
    if (!apiKeyInput.trim() || apiKeyInput.length < 20) return alert("مفتاح API غير صالح");
    setIsSavingKey(true);
    try {
      await set(ref(db, 'admin_config/gemini_api_key'), apiKeyInput.trim());
      geminiService.setDynamicApiKey(apiKeyInput.trim());
      setIsSavingKey(false);
      audioService.playSuccess();
      setLogs(prev => [`${new Date().toLocaleTimeString()} - تم تحديث مفتاح API لجميع المستخدمين`, ...prev]);
    } catch (err) {
      alert("فشل تحديث المفتاح: خطأ في الصلاحيات");
      setIsSavingKey(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastInput.trim()) return;
    setIsLoading(true);
    try {
      await set(ref(db, 'broadcasts/current'), {
        message: broadcastInput,
        timestamp: serverTimestamp(),
        author: user.name
      });
      setBroadcastInput('');
      audioService.playSuccess();
      setLogs(prev => [`${new Date().toLocaleTimeString()} - تم إرسال تنبيه عام`, ...prev]);
    } catch (err) {
      alert('خطأ في البث: تأكد من الصلاحيات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] text-slate-300 font-['Cairo'] overflow-hidden" dir="rtl">
      {/* Admin Header */}
      <header className="px-6 md:px-10 py-6 bg-slate-900/95 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <ShieldCheck size={28} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">لوحة التحكم الكاملة</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Master Admin Connected</span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-2">
          <TabButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<Activity size={18} />} label="الإحصائيات" />
          <TabButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={<Users size={18} />} label="الطلاب" />
          <TabButton active={activeView === 'summaries'} onClick={() => setActiveView('summaries')} icon={<FileText size={18} />} label="إدارة الملخصات" />
          <TabButton active={activeView === 'posts'} onClick={() => setActiveView('posts')} icon={<MessageSquare size={18} />} label="الرقابة" />
          <TabButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={18} />} label="النظام & API" />
        </div>

        <button 
           onClick={() => { window.location.reload(); }}
           className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all text-xs font-black"
        >
          خروج الآدمن
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        
        {activeView === 'stats' && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Radio size={24} className="animate-pulse" /> إعلان مباشر للطلاب</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder="اكتب رسالة ستظهر فوراً في أعلى التطبيق لجميع الطلاب..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none font-bold placeholder:text-white/40"
                    value={broadcastInput}
                    onChange={(e) => setBroadcastInput(e.target.value)}
                  />
                  <button onClick={handleBroadcast} disabled={isLoading || !broadcastInput.trim()} className="px-10 py-4 bg-white text-blue-700 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                    بث الإعلان الآن
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatBox label="الطلاب المسجلين" value={stats.users} color="text-blue-400" />
              <StatBox label="منشورات المجتمع" value={stats.posts} color="text-emerald-400" />
              <StatBox label="الملخصات المرفوعة" value={stats.summaries} color="text-amber-400" />
              <StatBox label="Gemini Key" value={apiKeyInput ? "نشط ✓" : "مفقود !"} color={apiKeyInput ? "text-indigo-400" : "text-rose-400"} />
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-8">
              <h4 className="text-white font-black mb-6 flex items-center gap-3"><Terminal size={20} className="text-emerald-500" /> سجل مخرجات النظام</h4>
              <div className="space-y-3 font-mono text-[11px] md:text-sm">
                {logs.map((log, i) => (
                  <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 text-slate-400">
                    <span className="text-emerald-500 mr-2">admin@dz-edu:~$</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'summaries' && (
          <div className="space-y-10 animate-slide-up">
            <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5">
               <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><PlusCircle className="text-indigo-500" /> إضافة ملخص جديد</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 text-right">
                   <label className="text-[10px] font-black text-slate-500 uppercase mr-2">عنوان الملخص</label>
                   <input 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all text-right"
                      value={newSummary.title}
                      onChange={e => setNewSummary({...newSummary, title: e.target.value})}
                      placeholder="مثال: ملخص الوحدة الأولى ميكانيك"
                   />
                 </div>
                 <div className="space-y-2 text-right">
                   <label className="text-[10px] font-black text-slate-500 uppercase mr-2">رابط الملف (Google Drive/PDF)</label>
                   <input 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all font-mono text-xs text-left"
                      value={newSummary.url}
                      onChange={e => setNewSummary({...newSummary, url: e.target.value})}
                      placeholder="https://..."
                   />
                 </div>
                 <div className="space-y-2 text-right">
                   <label className="text-[10px] font-black text-slate-500 uppercase mr-2">المادة</label>
                   <select 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 outline-none focus:border-indigo-500 text-white text-right"
                      value={newSummary.subject}
                      onChange={e => setNewSummary({...newSummary, subject: e.target.value})}
                   >
                     {Object.values(STREAM_SUBJECTS['علوم تجريبية']).map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                   </select>
                 </div>
                 <div className="flex items-end">
                    <button 
                      onClick={handleAddSummary}
                      disabled={isLoading}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" /> : <><Save size={20} /> حفظ الملخص في القاعدة</>}
                    </button>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSummaries.map(s => (
                <div key={s.id} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                      <FileText size={20} />
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white text-xs">{s.title}</p>
                      <p className="text-[9px] text-slate-500">{s.subject}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSummary(s.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-10 animate-slide-up max-w-2xl mx-auto">
            <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-5 mb-10">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                    <Key size={36} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-3xl font-black text-white">إعدادات Gemini API</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Global API Key Management</p>
                  </div>
               </div>

               <div className="space-y-8">
                 <div className="space-y-4 text-right">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">مفتاح API الموحد لجميع الطلاب (Realtime DB)</label>
                    <div className="relative">
                       <input 
                          type={showApiKey ? "text" : "password"} 
                          className="w-full pr-6 pl-14 py-6 bg-black/40 border-2 border-white/5 rounded-[2rem] focus:border-indigo-500 outline-none transition-all font-mono text-sm text-indigo-200 text-left"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder="AIzaSy..."
                       />
                       <button onClick={() => setShowApiKey(!showApiKey)} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                          {showApiKey ? <EyeOff size={22} /> : <Eye size={22} />}
                       </button>
                    </div>
                 </div>
                 
                 <button 
                   onClick={handleSaveApiKeyToDB} 
                   disabled={isSavingKey} 
                   className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-indigo-900/20 flex items-center justify-center gap-4 active:scale-95 transition-all"
                 >
                   {isSavingKey ? <RefreshCw className="animate-spin" /> : <><Database size={20} /> تحديث المفتاح في قاعدة البيانات</>}
                 </button>
               </div>
            </div>
            
            <div className="p-8 bg-amber-500/10 rounded-[3rem] border border-amber-500/20 flex items-start gap-4 text-right">
               <AlertCircle className="text-amber-500 shrink-0" size={24} />
               <div className="space-y-1">
                 <p className="text-sm font-black text-amber-200">تنبيه أمني هام</p>
                 <p className="text-[11px] text-amber-100/70 leading-relaxed font-bold">
                   تغيير هذا المفتاح سيؤثر على جميع ميزات الذكاء الاصطناعي في جميع نسخ التطبيق النشطة. يرجى التأكد من صحة المفتاح.
                 </p>
               </div>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="space-y-6 animate-slide-up text-right">
            <h3 className="text-2xl font-black text-white mb-6">إدارة حسابات الطلاب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers.map(u => (
                <div key={u.id} className="bg-slate-900 p-6 rounded-2xl border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <button onClick={async () => {
                    if (u.email === "nacero1234@gmail.com") return;
                    if (window.confirm("حظر الطالب؟")) await remove(ref(db, `users/${u.id}`));
                  }} className="p-3 text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'posts' && (
          <div className="space-y-6 animate-slide-up text-right">
            <h3 className="text-2xl font-black text-white">الرقابة على المجتمع</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allPosts.map(post => (
                <div key={post.id} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-indigo-400">{post.author}</span>
                      <span className="text-[9px] text-slate-500">{post.time}</span>
                    </div>
                    <button onClick={async () => {
                       if (window.confirm("حذف المنشور؟")) await remove(ref(db, `community_posts/${post.id}`));
                    }} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 text-right">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-white/5 px-6 py-4 flex justify-around items-center md:hidden z-50 pb-8">
        <button onClick={() => setActiveView('stats')} className={`p-3 rounded-2xl ${activeView === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><Activity size={24} /></button>
        <button onClick={() => setActiveView('users')} className={`p-3 rounded-2xl ${activeView === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><Users size={24} /></button>
        <button onClick={() => setActiveView('summaries')} className={`p-3 rounded-2xl ${activeView === 'summaries' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><FileText size={24} /></button>
        <button onClick={() => setActiveView('settings')} className={`p-3 rounded-2xl ${activeView === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><Settings size={24} /></button>
      </nav>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>
    {icon} {label}
  </button>
);

const StatBox = ({ label, value, color }: any) => (
  <div className="bg-slate-900/50 p-6 rounded-[1.5rem] border border-white/5 text-right">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
    <span className={`text-3xl font-black ${color}`}>{value}</span>
  </div>
);

export default AdminPanel;
