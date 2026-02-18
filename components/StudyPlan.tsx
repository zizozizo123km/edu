
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Timer, 
  Brain, 
  Loader2, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Target,
  Printer,
  ChevronDown,
  ChevronUp,
  Layout,
  Clock,
  Zap,
  Flame
} from 'lucide-react';
import { UserState, StudyTask } from '../types';
import { geminiService } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { STREAM_SUBJECTS } from '../constants';
import { marked } from 'marked';

interface StudyPlanProps {
  user: UserState;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const StudyPlan: React.FC<StudyPlanProps> = ({ user }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiPlanHtml, setAiPlanHtml] = useState<string | null>(null);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // تحديد موعد البكالوريا: 13 جوان
    const getBacDate = () => {
      const now = new Date();
      let year = now.getFullYear();
      let bacDate = new Date(`${year}-06-13T08:00:00`);
      
      // إذا مر تاريخ 13 جوان لهذا العام، نستهدف العام القادم
      if (now > bacDate) {
        bacDate = new Date(`${year + 1}-06-13T08:00:00`);
      }
      return bacDate;
    };

    const targetDate = getBacDate();
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    audioService.playSuccess();
    if (timerMode === 'work') {
      setTimerMode('break');
      setTimeLeft(5 * 60);
    } else {
      setTimerMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => {
    audioService.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    audioService.playClick();
    setIsActive(false);
    setTimeLeft(timerMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: StudyTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      subject: 'عام',
      completed: false,
      duration: 25
    };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    audioService.playClick();
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    audioService.playSuccess();
  };

  const handleGenerateAiPlan = async () => {
    if (weakSubjects.length === 0) {
      setErrorMsg("يرجى اختيار مادة واحدة على الأقل لملء الجدول.");
      return;
    }
    setErrorMsg(null);
    setIsGenerating(true);
    audioService.playClick();
    try {
      const markdown = await geminiService.generateStudyPlan(user.stream, weakSubjects, hoursPerDay);
      const html = await marked.parse(markdown);
      setAiPlanHtml(html);
    } catch (error: any) {
      setErrorMsg(error.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-slide-up pb-24 text-right">
      {/* Immersive Countdown Header - Targeted at June 13 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-right max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] md:text-xs font-black mb-6 border border-white/20 uppercase tracking-widest animate-pulse">
               <Zap size={14} className="text-yellow-400" /> البكالوريا: 13 جوان 🇩🇿
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tighter">
              باقي على <span className="text-blue-300">الحلم</span> 🎓
            </h1>
            <p className="text-blue-100/80 text-base md:text-xl font-medium leading-relaxed mb-8">
              الوقت يمر بسرعة، لكن عزيمتك أقوى. استغل كل دقيقة متبقية لتصنع مستقبلك يا {user.name.split(' ')[0]}.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full lg:w-auto">
            <CountdownBox value={countdown.days} label="يوم" color="bg-blue-500" />
            <CountdownBox value={countdown.hours} label="ساعة" color="bg-indigo-500" />
            <CountdownBox value={countdown.minutes} label="دقيقة" color="bg-violet-500" />
            <CountdownBox value={countdown.seconds} label="ثانية" color="bg-rose-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          
          {/* Daily Tasks */}
          <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-colors"></div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-8 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CheckCircle2 size={24} />
              </div>
              أهدافي اليومية
            </h2>
            
            <div className="flex gap-3 mb-8">
              <input 
                type="text" 
                placeholder="أضف مراجعة مادة أو هدف محدد..."
                className="flex-1 bg-gray-50/80 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-black text-sm md:text-lg shadow-inner"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <button 
                onClick={addTask}
                className="bg-blue-600 text-white p-4 md:p-5 rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all group"
              >
                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/30 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <Flame size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-black text-sm text-gray-400">لا توجد مهام حالياً. ابدأ بإضافة أول هدف!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${
                      task.completed ? 'bg-emerald-50 border-emerald-100 opacity-70' : 'bg-white border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${task.completed ? 'text-emerald-500 scale-110' : 'text-gray-300 group-hover:text-blue-400'}`}>
                      {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                    </div>
                    <span className={`flex-1 font-black text-sm md:text-lg ${task.completed ? 'line-through text-emerald-700' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                    {task.completed && <span className="text-[10px] font-black text-emerald-600 uppercase bg-white px-3 py-1 rounded-full shadow-sm">تم الإنجاز</span>}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* AI Plan Section */}
          <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-4 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Brain size={24} />
              </div>
              المخطط الذكي
            </h2>
            <p className="text-gray-500 font-bold mb-8 text-xs md:text-base leading-relaxed">
              يقوم الذكاء الاصطناعي بتحليل نقاط ضعفك وتوليد جدول مراجعة مثالي يناسب نمط حياتك.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                 <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                   <Target size={14} className="text-indigo-500" /> المواد التي تحتاج مراجعة مكثفة:
                 </label>
                 <div className="flex flex-wrap gap-2.5">
                  {STREAM_SUBJECTS[user.stream]?.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setWeakSubjects(prev => prev.includes(subject.name) ? prev.filter(s => s !== subject.name) : [...prev, subject.name])}
                      className={`px-4 py-2.5 rounded-xl font-black text-[11px] md:text-xs transition-all border-2 ${
                        weakSubjects.includes(subject.name) 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-105' 
                          : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                   <Clock size={14} className="text-indigo-500" /> عدد ساعات الدراسة المتاحة يومياً:
                 </label>
                 <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border-2 border-gray-100 focus-within:border-indigo-200 transition-all">
                    <button onClick={() => setHoursPerDay(Math.max(2, hoursPerDay-1))} className="p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"><ChevronDown size={20}/></button>
                    <span className="flex-1 text-center font-black text-xl md:text-2xl text-gray-800">{hoursPerDay} ساعة</span>
                    <button onClick={() => setHoursPerDay(Math.min(14, hoursPerDay+1))} className="p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"><ChevronUp size={20}/></button>
                 </div>
              </div>
            </div>

            {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black flex items-center gap-3 border border-red-100 animate-slide-up"><AlertCircle size={20} /> {errorMsg}</div>}

            <button 
              onClick={handleGenerateAiPlan}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-sm md:text-lg disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={24} /> توليد المخطط الذكي الآن</>}
            </button>

            {/* Responsive Table Area */}
            <div className="mt-10 p-6 md:p-10 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-indigo-100 shadow-2xl min-h-[400px] relative overflow-hidden group">
              {!aiPlanHtml && !isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 p-10 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Layout size={48} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-400">جدولك الدراسي في انتظارك</h3>
                  <p className="text-xs md:text-sm text-gray-300 font-bold mt-2">اختر ساعاتك وموادك ودع الذكاء الاصطناعي يقوم بالباقي</p>
                </div>
              ) : isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-white/80 backdrop-blur-sm z-10">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                      <Brain size={48} className="text-indigo-600" />
                    </div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-black text-indigo-700">جاري تحليل بياناتك...</h3>
                  <p className="text-gray-400 font-bold mt-2">نحن نصمم أفضل جدول مراجعة مخصص لك</p>
                </div>
              ) : (
                <div className="animate-slide-up">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                    <h3 className="font-black text-base md:text-xl text-indigo-700 flex items-center gap-3">
                      <Target size={24} /> جدول المراجعة المقترح للأسبوع
                    </h3>
                    <button onClick={() => window.print()} className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors no-print">
                      <Printer size={20} />
                    </button>
                  </div>
                  <div className="markdown-container" dangerouslySetInnerHTML={{ __html: aiPlanHtml! }} />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6 md:space-y-10">
          <section className="bg-gray-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl text-center no-print relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="text-lg md:text-xl font-black mb-10 flex items-center justify-center gap-3 relative z-10">
              <div className="p-2 bg-white/10 rounded-xl">
                <Timer className="text-blue-400" size={24} />
              </div>
              مؤقت التركيز
            </h3>
            
            <div className="relative inline-flex items-center justify-center mb-10 z-10">
              <svg className="w-44 h-44 md:w-52 md:h-52 transform -rotate-90">
                <circle cx="50%" cy="50%" r="46%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="46%" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="100" 
                  strokeDashoffset={100 - (100 * timeLeft) / (timerMode === 'work' ? 25 * 60 : 5 * 60)} 
                  // pathLength moved to prop to fix Error on line 375
                  pathLength={100}
                  className={`transition-all duration-1000 stroke-linecap-round ${timerMode === 'work' ? 'text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">{formatTime(timeLeft)}</div>
                <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${timerMode === 'work' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                  {timerMode === 'work' ? 'وضع التركيز' : 'وقت الراحة'}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center relative z-10">
              <button 
                onClick={toggleTimer} 
                className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-rose-600 shadow-rose-900/40' : 'bg-blue-600 shadow-blue-900/40'}`}
              >
                {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>
              <button 
                onClick={resetTimer} 
                className="w-16 h-16 md:w-20 md:h-20 bg-white/10 hover:bg-white/20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center transition-all border border-white/10"
              >
                <RotateCcw size={28} />
              </button>
            </div>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm no-print group">
            <h3 className="font-black text-lg md:text-xl text-gray-800 mb-10 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:rotate-12 transition-transform">
                <Target size={24} />
              </div>
              الإنجاز الأسبوعي
            </h3>
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">المهام المكتملة</span>
                    <div className="text-3xl md:text-4xl font-black text-gray-800">18/25</div>
                  </div>
                  <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1 shadow-sm">
                    <Zap size={14} /> +12%
                  </div>
               </div>
               <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                  <div className="bg-emerald-500 h-full w-[72%] rounded-full shadow-lg shadow-emerald-100 transition-all duration-1000"></div>
               </div>
               <p className="text-gray-400 text-[11px] font-bold text-center italic">"لقد أنجزت معظم مهامك بنجاح هذا الأسبوع. واصل العطاء!"</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const CountdownBox = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] ${color} shadow-2xl shadow-indigo-900/20 group hover:-translate-y-2 transition-transform duration-300`}>
    <div className="text-2xl md:text-4xl font-black mb-1 drop-shadow-md">{value.toString().padStart(2, '0')}</div>
    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-white/70">{label}</div>
  </div>
);

export default StudyPlan;
