
import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { Post, UserState, Summary } from '../types';
import { SUMMARIES_DATA } from '../constants';
import { audioService } from '../services/audioService';

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
  
  // Mock users data for "Control"
  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: 'أحمد محمود', stream: 'علوم تجريبية', status: 'نشط', rank: 'طالب متميز' },
    { id: 2, name: 'ليلى بن عودة', stream: 'رياضيات', status: 'نشط', rank: 'طالب مجتهد' },
    { id: 3, name: 'سفيان دراجي', stream: 'تقني رياضي', status: 'محظور', rank: 'طالب' },
    { id: 4, name: 'مريم جبار', stream: 'لغات أجنبية', status: 'نشط', rank: 'طالب متميز' },
  ]);

  const stats = [
    { label: 'إجمالي الطلاب', value: '12,450', change: '+12%', icon: <Users />, color: 'bg-blue-500' },
    { label: 'الملخصات المرفوعة', value: '842', change: '+5%', icon: <FileText />, color: 'bg-indigo-500' },
    { label: 'تفاعلات اليوم', value: '4,120', change: '+18%', icon: <Activity />, color: 'bg-emerald-500' },
    { label: 'سعة التخزين', value: '45.2 GB', change: '85%', icon: <Server />, color: 'bg-amber-500' }
  ];

  const handleBroadcast = () => {
    if (onBroadcast) {
      onBroadcast(broadcastInput || null);
      if (broadcastInput) audioService.playSuccess();
      setBroadcastInput('');
    }
  };

  const deletePost = (id: number) => {
    onPostUpdate(posts.filter(p => p.id !== id));
    audioService.playClick();
  };

  const deleteSummary = (id: number | string) => {
    setSummaries(summaries.filter(s => s.id !== id));
    audioService.playClick();
  };

  const toggleUserStatus = (id: number) => {
    setMockUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'نشط' ? 'محظور' : 'نشط' } : u));
    audioService.playClick();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0F172A] text-slate-200 animate-slide-up overflow-hidden">
      {/* Admin Header - Cyberpunk Control Center Style */}
      <div className="px-6 md:px-10 py-6 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between shrink-0 gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">مركز القيادة والتحكم <span className="text-emerald-500 text-xs ml-2 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">v2.4 Live</span></h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">المشرف الحالي: {user.name}</p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700 backdrop-blur-md">
          <TabButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<TrendingUp size={18} />} label="الرادار" />
          <TabButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={<Users size={18} />} label="الطلاب" />
          <TabButton active={activeView === 'summaries'} onClick={() => setActiveView('summaries')} icon={<FileText size={18} />} label="الموارد" />
          <TabButton active={activeView === 'posts'} onClick={() => setActiveView('posts')} icon={<MessageSquare size={18} />} label="الرقابة" />
          <TabButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={18} />} label="النظام" />
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        
        {activeView === 'stats' && (
          <div className="space-y-10">
            {/* Broadcast Control Section */}
            <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-xl relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0 w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 text-indigo-400 animate-pulse">
                    <Radio size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-xl font-black text-white mb-2">بث تنبيه عالمي (Global Broadcast)</h3>
                    <p className="text-slate-400 text-xs font-medium mb-4">ستظهر هذه الرسالة فوراً لجميع المستخدمين المتصلين بالمنصة.</p>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="اكتب رسالة التنبيه هنا..."
                        className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-6 py-3 text-sm outline-none focus:border-indigo-500 transition-all text-white font-bold"
                        value={broadcastInput}
                        onChange={(e) => setBroadcastInput(e.target.value)}
                      />
                      <button 
                        onClick={handleBroadcast}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg flex items-center gap-2"
                      >
                        إرسال <Send size={18} className="rotate-180" />
                      </button>
                      <button 
                        onClick={() => onBroadcast && onBroadcast(null)}
                        className="bg-slate-800 text-slate-400 px-4 py-3 rounded-xl hover:text-white transition-all border border-slate-700"
                      >
                        إلغاء البث
                      </button>
                    </div>
                  </div>
               </div>
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.05)_0%,transparent_50%)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-sm hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 ${s.color} text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      {s.icon}
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">{s.change}</span>
                  </div>
                  <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</h4>
                  <p className="text-3xl font-black text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-sm min-h-[400px]">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xl flex items-center gap-3 text-white"><Activity className="text-blue-500" /> مراقبة الموارد الحية</h3>
                    <select className="bg-slate-800 border-slate-700 border text-slate-300 px-4 py-2 rounded-xl text-xs font-black outline-none">
                      <option>تحميلات الملفات</option>
                      <option>نشاط المستخدمين</option>
                    </select>
                 </div>
                 {/* Simulated Graph */}
                 <div className="h-64 flex items-end justify-between gap-3 px-4">
                    {[40, 70, 45, 90, 65, 80, 55, 60, 40, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/10 rounded-t-xl relative group">
                        <div className="absolute bottom-0 w-full bg-blue-500/40 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-500" style={{ height: `${h}%` }}></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded shadow-lg">{h}%</div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Now</span>
                 </div>
              </div>

              <div className="bg-slate-950 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden border border-slate-800">
                <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-amber-500"><AlertTriangle /> أحداث النظام الحرجة</h3>
                <div className="space-y-4">
                   <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-xs leading-relaxed text-red-200">
                     <span className="text-red-500 font-black">تحذير:</span> محاولة دخول غير مصرح بها من عنوان IP مجهول.
                   </div>
                   <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs leading-relaxed text-emerald-200">
                     <span className="text-emerald-500 font-black">نجاح:</span> تم إجراء النسخ الاحتياطي لقاعدة البيانات.
                   </div>
                   <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-xs leading-relaxed text-blue-200">
                     <span className="text-blue-500 font-black">إشعار:</span> تحديث Gemini 2.5 Flash Native جاهز للاستخدام.
                   </div>
                </div>
                <div className="mt-10 p-6 bg-slate-900 rounded-2xl border border-slate-800">
                   <p className="text-[10px] font-black text-slate-500 mb-2 uppercase">حالة الخادم</p>
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-sm font-black">مستقر بنسبة 99.9%</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-sm overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-xl text-white">إدارة المستخدمين والتحكم في الحسابات</h3>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/20"><UserPlus size={16} /> إضافة طالب</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">الطالب</th>
                    <th className="px-8 py-5">الشعبة</th>
                    <th className="px-8 py-5">الرتبة</th>
                    <th className="px-8 py-5">الحالة</th>
                    <th className="px-8 py-5">تحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {mockUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-700">{u.name.charAt(0)}</div>
                          <span className="font-black text-sm text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-xs text-slate-400">{u.stream}</td>
                      <td className="px-8 py-5 font-black text-xs text-blue-400">{u.rank}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${u.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleUserStatus(u.id)} className={`p-2 transition-colors ${u.status === 'نشط' ? 'text-slate-500 hover:text-red-500' : 'text-red-500 hover:text-emerald-500'}`} title={u.status === 'نشط' ? 'حظر' : 'تنشيط'}>
                            {u.status === 'نشط' ? <Ban size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button className="p-2 text-slate-500 hover:text-blue-500"><Settings size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'summaries' && (
          <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-sm overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-xl text-white">مراجعة المحتوى التعليمي</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="text" placeholder="بحث في الموارد..." className="bg-slate-950 border-slate-800 border pr-10 pl-4 py-2.5 rounded-xl text-xs outline-none focus:border-blue-500 w-64 text-white" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">العنوان</th>
                    <th className="px-8 py-5">المؤلف</th>
                    <th className="px-8 py-5">التحميلات</th>
                    <th className="px-8 py-5">التوثيق</th>
                    <th className="px-8 py-5">إدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {summaries.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0`}>{s.icon}</div>
                          <div>
                            <p className="font-black text-sm text-white">{s.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{s.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-xs text-slate-400">{s.author}</td>
                      <td className="px-8 py-5 font-black text-sm text-slate-300">{s.downloads.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20">رسمي</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => deleteSummary(s.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          <button className="p-2 text-slate-500 hover:text-emerald-500"><Eye size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'posts' && (
          <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-sm overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-800">
               <h3 className="font-black text-xl text-white">المراقبة الأخلاقية للمجتمع</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {posts.map(post => (
                <div key={post.id} className="p-8 hover:bg-slate-800/50 transition-all flex items-start justify-between gap-6">
                   <div className="flex gap-4">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatarSeed}`} className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700" alt="user" />
                      <div>
                         <h4 className="font-black text-white flex items-center gap-2">
                           {post.author} <span className="text-[10px] font-bold text-slate-500">{post.time}</span>
                         </h4>
                         <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-2xl">{post.content}</p>
                         <div className="flex items-center gap-4 mt-4">
                           <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{post.tag}</span>
                           <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><TrendingUp size={12} /> {post.likes} إعجاب</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
                        <CheckCircle size={14} /> موافقة
                      </button>
                      <button onClick={() => deletePost(post.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-black border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14} /> حذف فوري
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-slide-up">
              <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-sm">
                 <h3 className="font-black text-xl mb-10 flex items-center gap-3 text-white"><Settings className="text-slate-500" /> إعدادات المحرك المركزي</h3>
                 <div className="space-y-8">
                    <SettingToggle label="تفعيل التسجيل الجديد" active={true} />
                    <SettingToggle label="وضع الصيانة (Under Maintenance)" active={false} />
                    <SettingToggle label="تفعيل محرك Gemini 3 Pro" active={true} />
                    <SettingToggle label="التحقق التلقائي من الروابط" active={true} />
                    <SettingToggle label="إظهار لوحة الشرف للجميع" active={true} />
                    <div className="pt-6">
                       <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">حفظ التغييرات <CheckCircle size={18}/></button>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-950 p-10 rounded-[3rem] border border-red-900/20 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                 <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <Lock size={48} />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-4">بروتوكول تدمير البيانات</h3>
                 <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4 text-xs md:text-sm">هذا الإجراء سيقوم بمسح كافة السجلات، التقارير، والبيانات المؤقتة من الخادم. لا يمكن التراجع عن هذا الفعل.</p>
                 <div className="flex flex-col gap-4 w-full relative z-10">
                    <button className="w-full py-4 bg-slate-900 text-slate-400 rounded-2xl font-black text-xs hover:text-white transition-all border border-slate-800">تفريغ ذاكرة التخزين المؤقت (Cache)</button>
                    <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-red-900/40 hover:bg-red-700 transition-all">إعادة تهيئة النظام بالكامل</button>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

const SettingToggle = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between p-2">
    <span className="font-bold text-slate-300 text-sm">{label}</span>
    <button className={`w-14 h-8 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

export default AdminPanel;
