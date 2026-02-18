
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
  Download,
  Eye,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { Post, UserState, Summary } from '../types';
import { SUMMARIES_DATA } from '../constants';
import { audioService } from '../services/audioService';

interface AdminPanelProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, posts, onPostUpdate }) => {
  const [activeView, setActiveView] = useState<'stats' | 'summaries' | 'posts' | 'settings'>('stats');
  const [summaries, setSummaries] = useState<Summary[]>(SUMMARIES_DATA);

  const stats = [
    { label: 'إجمالي الطلاب', value: '12,450', change: '+12%', icon: <Users />, color: 'bg-blue-500' },
    { label: 'الملخصات المرفوعة', value: '842', change: '+5%', icon: <FileText />, color: 'bg-indigo-500' },
    { label: 'تفاعلات اليوم', value: '4,120', change: '+18%', icon: <Activity />, color: 'bg-emerald-500' },
    { label: 'سعة التخزين', value: '45.2 GB', change: '85%', icon: <Server />, color: 'bg-amber-500' }
  ];

  const deletePost = (id: number) => {
    onPostUpdate(posts.filter(p => p.id !== id));
    audioService.playClick();
  };

  const deleteSummary = (id: number | string) => {
    setSummaries(summaries.filter(s => s.id !== id));
    audioService.playClick();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] animate-slide-up">
      {/* Admin Header */}
      <div className="px-6 md:px-10 py-6 bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">مركز التحكم الإداري</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">مرحباً أدمن: {user.name}</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <TabButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<TrendingUp size={18} />} label="الإحصائيات" />
          <TabButton active={activeView === 'summaries'} onClick={() => setActiveView('summaries')} icon={<FileText size={18} />} label="الملخصات" />
          <TabButton active={activeView === 'posts'} onClick={() => setActiveView('posts')} icon={<MessageSquare size={18} />} label="المنشورات" />
          <TabButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={18} />} label="الإعدادات" />
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        
        {activeView === 'stats' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 ${s.color} text-white rounded-xl flex items-center justify-center shadow-lg`}>
                      {s.icon}
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg">{s.change}</span>
                  </div>
                  <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</h4>
                  <p className="text-3xl font-black text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px]">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xl flex items-center gap-3"><Activity className="text-blue-500" /> الرسم البياني للنشاط</h3>
                    <select className="bg-gray-50 border-none px-4 py-2 rounded-xl text-xs font-black outline-none">
                      <option>آخر 7 أيام</option>
                      <option>آخر 30 يوم</option>
                    </select>
                 </div>
                 {/* Simulated Graph */}
                 <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 rounded-t-xl relative group">
                        <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-700" style={{ height: `${h}%` }}></div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-gray-400">
                    <span>السبت</span><span>الأحد</span><span>الاثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span>
                 </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-amber-400"><AlertTriangle /> تنبيهات النظام</h3>
                <div className="space-y-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs leading-relaxed">
                     <span className="text-amber-500 font-black">تحذير:</span> تقارير متزايدة حول منشورات سبام في ساحة المجتمع.
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs leading-relaxed">
                     <span className="text-emerald-500 font-black">تحديث:</span> تم تحديث قاعدة بيانات الذكاء الاصطناعي بنجاح.
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs leading-relaxed">
                     <span className="text-blue-500 font-black">إشعار:</span> تم تسجيل 150 مستخدم جديد في الساعة الأخيرة.
                   </div>
                </div>
                <button className="w-full mt-10 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all">تحميل السجلات (Logs)</button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'summaries' && (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-xl">إدارة الملخصات والموارد</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="بحث في الموارد..." className="pr-10 pl-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 w-64" />
                </div>
                <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100"><Filter size={20} /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">العنوان والمادة</th>
                    <th className="px-8 py-5">المؤلف</th>
                    <th className="px-8 py-5">التحميلات</th>
                    <th className="px-8 py-5">الحالة</th>
                    <th className="px-8 py-5">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summaries.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0`}>{s.icon}</div>
                          <div>
                            <p className="font-black text-sm text-gray-800">{s.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{s.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-sm text-gray-600">{s.author}</td>
                      <td className="px-8 py-5 font-black text-sm text-gray-800">{s.downloads.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">موثق</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={18} /></button>
                          <button onClick={() => deleteSummary(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical size={18} /></button>
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
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-gray-50">
               <h3 className="font-black text-xl">رقابة ساحة المجتمع</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {posts.map(post => (
                <div key={post.id} className="p-8 hover:bg-gray-50 transition-all flex items-start justify-between gap-6">
                   <div className="flex gap-4">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatarSeed}`} className="w-12 h-12 rounded-xl bg-gray-100" alt="user" />
                      <div>
                         <h4 className="font-black text-gray-800 flex items-center gap-2">
                           {post.author} <span className="text-[10px] font-bold text-gray-400">{post.time}</span>
                         </h4>
                         <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-2xl">{post.content}</p>
                         <div className="flex items-center gap-4 mt-4">
                           <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">{post.tag}</span>
                           <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><TrendingUp size={12} /> {post.likes} إعجاب</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black border border-emerald-100 hover:bg-emerald-100 transition-all">
                        <CheckCircle size={14} /> إبقاء
                      </button>
                      <button onClick={() => deletePost(post.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black border border-red-100 hover:bg-red-100 transition-all">
                        <Trash2 size={14} /> حذف
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-slide-up">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                 <h3 className="font-black text-xl mb-10 flex items-center gap-3"><Settings className="text-gray-400" /> إعدادات النظام العامة</h3>
                 <div className="space-y-8">
                    <SettingToggle label="تفعيل التسجيل الجديد" active={true} />
                    <SettingToggle label="وضع الصيانة (Maintenance)" active={false} />
                    <SettingToggle label="تفعيل ميزة الذكاء الاصطناعي" active={true} />
                    <SettingToggle label="الرقابة الآلية على الكلمات" active={true} />
                    <div className="pt-6">
                       <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">حفظ جميع الإعدادات</button>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                 <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8">
                    <AlertTriangle size={48} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-800 mb-4">منطقة الخطر</h3>
                 <p className="text-gray-500 font-medium mb-10 leading-relaxed">كن حذراً جداً في هذه المنطقة. الإجراءات المتخذة هنا لا يمكن التراجع عنها وغالباً ما تؤثر على جميع المستخدمين.</p>
                 <div className="flex flex-col gap-4 w-full">
                    <button className="w-full py-4 border-2 border-red-100 text-red-600 rounded-2xl font-black text-xs hover:bg-red-50 transition-all">حذف سجلات النشاط (Logs)</button>
                    <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-red-100 hover:bg-red-700 transition-all">إعادة تهيئة قاعدة البيانات</button>
                 </div>
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
    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black transition-all ${
      active ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

const SettingToggle = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between p-2">
    <span className="font-bold text-gray-700 text-sm">{label}</span>
    <button className={`w-14 h-8 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${active ? 'right-7' : 'right-1'}`}></div>
    </button>
  </div>
);

export default AdminPanel;
