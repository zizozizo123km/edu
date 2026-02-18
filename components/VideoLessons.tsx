
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Youtube, 
  BookOpen, 
  Sparkles, 
  Loader2, 
  Info, 
  X, 
  ChevronLeft, 
  ExternalLink,
  Award,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { TOP_TEACHERS } from '../constants';

interface VideoResult {
  title: string;
  url: string;
  thumbnail?: string;
  id?: string;
}

const VideoLessons: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [videoList, setVideoList] = useState<VideoResult[]>([]);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const [isReading, setIsReading] = useState(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const [exercises, setExercises] = useState<string | null>(null);
  const [isGeneratingExercises, setIsGeneratingExercises] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dzair_video_history');
    if (saved) setHistory(JSON.parse(saved));
    return () => stopAudio();
  }, []);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\&v=)|(shorts\/))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[9].length === 11) ? match[9] : null;
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    audioService.stopNative();
    setIsReading(false);
  };

  const handleSearch = async (forcedQuery?: string) => {
    const activeQuery = forcedQuery || query;
    if (!activeQuery.trim()) return;
    
    stopAudio();
    setIsSearching(true);
    setSearchAttempted(true);
    setVideoList([]);
    setAnalysisText(null);
    setSelectedVideo(null);
    setExercises(null);

    const newHistory = [activeQuery, ...history.filter(h => h !== activeQuery)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('dzair_video_history', JSON.stringify(newHistory));

    try {
      const data = await geminiService.searchLessonVideos(activeQuery);
      if (data && data.videos && data.videos.length > 0) {
        const mappedVideos = data.videos.map(v => {
          const id = extractYoutubeId(v.url);
          return {
            ...v,
            id: id || undefined,
            thumbnail: id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : undefined
          };
        }).filter(v => v.id);
        setVideoList(mappedVideos);
      }
      setAnalysisText(data.text);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVideo = (video: VideoResult) => {
    if (!video.id) {
       window.open(video.url, '_blank');
       return;
    }
    setSelectedVideo(video);
    audioService.playClick();
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLoadExercises = async () => {
    if (!query) return;
    setIsGeneratingExercises(true);
    audioService.playClick();
    try {
      const content = await geminiService.generateExercises(query);
      setExercises(content);
    } catch (error) {
      console.error("Exercises failed", error);
    } finally {
      setIsGeneratingExercises(false);
    }
  };

  return (
    <div className="space-y-10 md:space-y-14 animate-slide-up pb-24 text-right">
      
      {/* Search & Hero Section */}
      <div className="bg-white p-8 md:p-14 rounded-3xl md:rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:rotate-6 transition-transform">
            <Youtube size={36} className="md:w-10 md:h-10" />
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-gray-800 mb-4 md:mb-6 leading-tight">
            مستكشف الدروس <span className="text-red-600">المرئي</span> 🎬
          </h1>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-gray-50 p-2 rounded-2xl md:rounded-[2rem] shadow-inner border border-gray-100 flex flex-col md:flex-row items-center gap-2 focus-within:ring-4 focus-within:ring-red-50 transition-all">
              <input 
                type="text"
                placeholder="ابحث عن درس أو أستاذ..."
                className="w-full bg-transparent border-none px-6 py-4 outline-none font-bold text-sm md:text-lg text-gray-700 placeholder:text-gray-300 text-right"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                className="w-full md:w-auto bg-red-600 text-white px-10 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-xs md:text-sm shadow-xl disabled:opacity-50 whitespace-nowrap active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <><Search size={18}/> بحث مرئي</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP TEACHERS SECTION - NEW */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-3">
            <Award className="text-amber-500" size={28} /> قنوات النخبة المقترحة
          </h2>
          <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
            اسحب للمزيد <ArrowRight size={14} className="rotate-180" />
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x px-2">
          {TOP_TEACHERS.map((teacher) => (
            <div 
              key={teacher.id}
              className="snap-start min-w-[240px] md:min-w-[280px] bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
                  <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                {teacher.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-4 border-white shadow-lg">
                    <CheckCircle size={14} fill="currentColor" />
                  </div>
                )}
              </div>
              
              <h3 className="font-black text-gray-800 text-lg mb-1">{teacher.name}</h3>
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black border border-red-100 mb-4">
                {teacher.subject}
              </span>
              
              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs mb-6">
                <Users size={14} /> {teacher.subscribers} متابع
              </div>
              
              <a 
                href={teacher.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => audioService.playClick()}
                className="w-full py-3 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-100 flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all"
              >
                دخول القناة <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
           <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Loader2 size={40} className="text-red-600 animate-spin" />
           </div>
           <h3 className="text-lg font-black text-gray-700">جاري مسح اليوتيوب والتحقق من الروابط...</h3>
        </div>
      )}

      {/* Video Results Grid */}
      {videoList.length > 0 && !selectedVideo && (
        <div className="space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg md:text-xl font-black text-gray-800 flex items-center gap-3">
              <Play className="text-red-600" size={24} /> نتائج البحث المخصصة
            </h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full">
              تم العثور على {videoList.length} فيديو
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoList.map((video, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSelectVideo(video)}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
              >
                <div className="relative aspect-video">
                  <img 
                    src={video.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80'} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-black text-gray-800 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors text-sm md:text-base mb-4">{video.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                      <Youtube size={12} />
                    </div>
                    {video.source} • مراجعة بكالوريا
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Video Player & Analysis */}
      {selectedVideo && selectedVideo.id && (
        <div ref={analysisRef} className="space-y-8 md:space-y-12 animate-slide-up">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="flex items-center gap-3 text-gray-500 font-black text-xs md:text-sm hover:text-red-600 transition-all bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md"
          >
            <ChevronLeft size={18} /> العودة لنتائج البحث
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl aspect-video border-4 md:border-8 border-white relative group">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0&autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="bg-white p-8 md:p-14 rounded-3xl md:rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                       <Sparkles size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-3xl font-black text-gray-800">تحليل المساعد الذكي</h2>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">أبرز النقاط والقوانين المستخلصة من الدرس</p>
                    </div>
                 </div>
                 <div className="prose prose-blue max-w-none text-gray-700 font-medium leading-[2] whitespace-pre-wrap text-sm md:text-lg">
                    {analysisText || "جاري جلب التحليل الذكي للدرس..."}
                 </div>
                 <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50 blur-2xl"></div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-900 p-8 md:p-10 rounded-3xl md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="font-black text-lg md:text-2xl mb-6 flex items-center gap-3">
                    <BookOpen className="text-blue-400" size={24} /> تمارين مقترحة
                  </h3>
                  <p className="text-gray-400 text-xs font-bold mb-8 leading-relaxed italic">جرب حل هذه التمارين المولدة آلياً للتأكد من فهمك العميق للدرس.</p>
                  <button 
                    onClick={handleLoadExercises}
                    disabled={isGeneratingExercises}
                    className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-900"
                  >
                    {isGeneratingExercises ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18}/> توليد تمارين الدرس</>}
                  </button>
                </div>
                <BookOpen className="absolute bottom-[-20px] left-[-20px] w-40 h-40 opacity-5 -rotate-12" />
              </div>

              {exercises && (
                <div className="bg-white p-8 rounded-3xl border-2 border-blue-50 shadow-xl animate-slide-up">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                    <h4 className="font-black text-blue-800 text-sm flex items-center gap-2"><Award size={16}/> التمارين والحلول</h4>
                    <button onClick={() => setExercises(null)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-colors"><X size={18}/></button>
                  </div>
                  <div className="text-xs font-bold text-gray-600 leading-[1.8] whitespace-pre-wrap">
                    {exercises}
                  </div>
                </div>
              )}

              <div className="bg-red-50 p-8 md:p-10 rounded-3xl md:rounded-[3rem] border border-red-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                    <Youtube size={24} />
                    <h4 className="font-black text-lg">مصدر الدرس</h4>
                  </div>
                  <p className="text-[11px] font-bold text-red-800/70 mb-8 leading-relaxed">لمتابعة الأستاذ ودعمه، يمكنك الانتقال مباشرة للقناة لمشاهدة السلسلة كاملة.</p>
                  <a 
                    href={selectedVideo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-4 bg-white text-red-600 rounded-2xl font-black text-xs md:text-sm border border-red-100 shadow-xl shadow-red-100 active:scale-95 transition-all"
                  >
                    مشاهدة في يوتيوب
                  </a>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!videoList.length && !isSearching && !searchAttempted && (
        <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 opacity-60 flex flex-col items-center">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
              <Youtube size={60} className="text-gray-200" />
           </div>
           <h3 className="text-2xl font-black text-gray-400">استخدم محرك البحث أعلاه</h3>
           <p className="text-sm font-bold text-gray-300 mt-2">أو اختر أحد الأساتذة من قائمة النخبة</p>
        </div>
      )}
    </div>
  );
};

export default VideoLessons;
