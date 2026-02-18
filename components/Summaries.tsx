
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Star, 
  FileText, 
  Filter, 
  Sparkles,
  BookOpen,
  Info,
  X,
  Loader2,
  ArrowRight,
  GraduationCap,
  Calendar,
  Layers,
  ChevronDown,
  Clock,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Share2,
  Headphones,
  Square,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ChevronUp,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Volume2
} from 'lucide-react';
import { SUMMARIES_DATA, STREAM_SUBJECTS } from '../constants';
import { Summary, UserState, StreamType } from '../types';
import { geminiService } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface SummariesProps {
  user: UserState;
  soundEnabled?: boolean;
}

type FileSizeFilter = 'الكل' | 'صغير' | 'متوسط' | 'كبير';
type DateFilter = 'الكل' | 'اليوم' | 'هذا الأسبوع' | 'هذا الشهر';
type SortByOption = 'downloads' | 'rating' | 'newest' | 'discussed';

const Summaries: React.FC<SummariesProps> = ({ user, soundEnabled = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('الكل');
  const [selectedStream, setSelectedStream] = useState<StreamType | 'الكل'>((user.stream as StreamType) || 'الكل');
  const [sortBy, setSortBy] = useState<SortByOption>('downloads');
  const [fileSizeFilter, setFileSizeFilter] = useState<FileSizeFilter>('الكل');
  const [dateFilter, setDateFilter] = useState<DateFilter>('الكل');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<any>(null);
  const [dynamicSummaries, setDynamicSummaries] = useState<any[]>([]);
  const [dismissedAiTags, setDismissedAiTags] = useState<Set<string | number>>(new Set());
  const [isStreamDropdownOpen, setIsStreamDropdownOpen] = useState(false);
  
  // Preview Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const streamDropdownRef = useRef<HTMLDivElement>(null);

  // Audio Reading State
  const [isReading, setIsReading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (streamDropdownRef.current && !streamDropdownRef.current.contains(event.target as Node)) {
        setIsStreamDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSubjectIcon = (subjectName: string) => {
    for (const stream in STREAM_SUBJECTS) {
      const subject = STREAM_SUBJECTS[stream].find(s => s.name === subjectName);
      if (subject) return subject.icon;
    }
    return '📚';
  };

  const triggerSound = (type: 'click' | 'success' = 'click') => {
    if (!soundEnabled) return;
    if (type === 'click') audioService.playClick();
    else audioService.playSuccess();
  };

  const handleShare = async (summary: any) => {
    triggerSound();
    const shareData = {
      title: `DzairEdu Pro - ${summary.title}`,
      text: `تحقق من هذا الملخص الرائع لمادة ${summary.subject}: "${summary.title}" من إعداد ${summary.author}. متاح مجاناً على منصة دزاير إيدو للبكالوريا! 📚🚀`,
      url: summary.url || window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('تم نسخ رابط المشاركة بنجاح!');
      } catch (err) {
        console.error('Clipboard error', err);
      }
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    audioService.stopNative();
    setIsReading(false);
    setIsLoadingAudio(false);
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const handleReadSummary = async (text: string) => {
    if (isReading || isLoadingAudio) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    triggerSound('success');

    try {
      const base64Audio = await geminiService.generateSpeech(text);
      if (!base64Audio) throw new Error("Audio generation failed");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsReading(false);
      
      sourceNodeRef.current = source;
      setIsLoadingAudio(false);
      setIsReading(true);
      source.start();
    } catch (error) {
      console.error("Gemini TTS failed, falling back to Browser TTS", error);
      setIsLoadingAudio(false);
      setIsReading(true);
      audioService.speakNative(text, () => setIsReading(false));
    }
  };

  useEffect(() => {
    if (!selectedPreview) {
      stopAudio();
      setCurrentPage(0);
    }
  }, [selectedPreview]);

  const allStreams = useMemo(() => {
    return ['الكل', ...Object.keys(STREAM_SUBJECTS)] as (StreamType | 'الكل')[];
  }, []);

  const parseSize = (sizeStr: any): number => {
    return parseFloat(sizeStr?.toString().replace(/[^\d.]/g, '') || '0');
  };

  const allAvailableSummaries = useMemo(() => {
    const local = SUMMARIES_DATA.map(s => ({ ...s, isDynamic: false }));
    const remote = dynamicSummaries.map(s => ({ 
      ...s, 
      isDynamic: true, 
      color: 'bg-indigo-600', 
      icon: '📄',
      streams: [user.stream || 'عام'],
      uploadDate: new Date().toISOString(),
      commentsCount: Math.floor(Math.random() * 50)
    }));
    return [...remote, ...local];
  }, [dynamicSummaries, user.stream]);

  const filteredSummaries = useMemo(() => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    return allAvailableSummaries
      .filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          s.title.toLowerCase().includes(term) || 
          s.author.toLowerCase().includes(term) ||
          s.subject.toLowerCase().includes(term);
        
        const matchesSubject = selectedSubject === 'الكل' || s.subject === selectedSubject;
        const matchesStream = selectedStream === 'الكل' || (s.streams && s.streams.includes(selectedStream as StreamType));
        
        const size = parseSize(s.fileSize);
        let matchesSize = true;
        if (fileSizeFilter === 'صغير') matchesSize = size < 1;
        else if (fileSizeFilter === 'متوسط') matchesSize = size >= 1 && size <= 3;
        else if (fileSizeFilter === 'كبير') matchesSize = size > 3;

        const uploadDate = new Date(s.uploadDate);
        const diffDays = (now.getTime() - uploadDate.getTime()) / oneDay;
        let matchesDate = true;
        if (dateFilter === 'اليوم') matchesDate = diffDays < 1;
        else if (dateFilter === 'هذا الأسبوع') matchesDate = diffDays <= 7;
        else if (dateFilter === 'هذا الشهر') matchesDate = diffDays <= 30;

        return matchesSearch && matchesSubject && matchesStream && matchesSize && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'discussed') return (b.commentsCount || 0) - (a.commentsCount || 0);
        if (sortBy === 'newest') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        return (b.id || 0) - (a.id || 0);
      });
  }, [allAvailableSummaries, searchTerm, selectedSubject, selectedStream, sortBy, fileSizeFilter, dateFilter]);

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) return;
    triggerSound('success');
    setIsAiSearching(true);
    setSearchError(null);
    try {
      const results = await geminiService.searchSummaries(searchTerm);
      if (results && Array.isArray(results)) {
        setDynamicSummaries(results);
        if (results.length === 0) {
          setSearchError("لم نجد نتائج دقيقة في المصادر الخارجية حالياً. جرب كلمات بحث أخرى.");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Advanced Search failed", error);
      if (error.message?.includes('429') || error.message?.includes('QUOTA')) {
        setSearchError("عذراً، انتهت حصة البحث الحالية (Quota Exceeded). يرجى المحاولة لاحقاً.");
      } else {
        setSearchError("حدث خطأ غير متوقع أثناء محاولة جلب النتائج. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearSearch = () => {
    triggerSound();
    setSearchTerm('');
    setDynamicSummaries([]);
    setSearchError(null);
    searchInputRef.current?.focus();
  };

  const dismissAiTag = (id: string | number) => {
    setDismissedAiTags(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    triggerSound();
  };

  const getFilterBtnClass = (isActive: boolean) => `
    px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2
    ${isActive 
      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105 z-10' 
      : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200 hover:text-blue-600 shadow-sm'
    }
  `;

  // Derived pagination for preview
  const previewPages = useMemo(() => {
    if (!selectedPreview || !selectedPreview.previewSnippet) return [""];
    return selectedPreview.previewSnippet.split('[PAGE]');
  }, [selectedPreview]);

  return (
    <div className="space-y-10 animate-slide-up pb-20 text-right" dir="rtl">
      {/* Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/20">
            <div className={`p-10 ${selectedPreview.color || 'bg-blue-600'} text-white relative`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl border border-white/20 shadow-xl shrink-0">
                    {selectedPreview.icon || '📄'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 block">
                      {getSubjectIcon(selectedPreview.subject)} {selectedPreview.subject}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black leading-tight truncate max-w-xs">{selectedPreview.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={selectedPreview.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerSound('success')}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all border border-white/20 text-white flex items-center gap-2"
                    title="تحميل مباشر"
                  >
                    <Download size={22} />
                  </a>
                  <button 
                    onClick={() => { triggerSound(); setSelectedPreview(null); }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-[60px]"></div>
            </div>

            <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar bg-gray-50/30 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black border border-emerald-100">
                    <CheckCircle2 size={16} /> ملف معتمد 2025
                  </div>
                  <button 
                    onClick={() => handleReadSummary(previewPages[currentPage])}
                    disabled={isLoadingAudio}
                    className={`flex items-center gap-3 px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md group ${
                      isReading 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : isLoadingAudio
                        ? 'bg-indigo-400 text-white cursor-wait'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isLoadingAudio ? (
                      <><Loader2 size={14} className="animate-spin" /> جاري التجهيز...</>
                    ) : isReading ? (
                      <><Square size={14} fill="white" /> إيقاف القراءة</>
                    ) : (
                      <><Headphones size={14} className="group-hover:rotate-12 transition-transform" /> استماع AI</>
                    )}
                  </button>
                </div>

                {previewPages.length > 1 && (
                  <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button 
                      onClick={() => { triggerSound(); setCurrentPage(prev => Math.min(previewPages.length - 1, prev + 1)); }}
                      disabled={currentPage === previewPages.length - 1}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <span className="text-xs font-black text-gray-500 px-2 min-w-[50px] text-center">
                      {currentPage + 1} / {previewPages.length}
                    </span>
                    <button 
                      onClick={() => { triggerSound(); setCurrentPage(prev => Math.max(0, prev - 1)); }}
                      disabled={currentPage === 0}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative flex-1 min-h-[300px]">
                <div className="absolute top-0 left-10 -translate-y-1/2 bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  صفحة {currentPage + 1}
                </div>
                {isReading && (
                  <div className="absolute top-5 right-5 flex items-center gap-2 text-indigo-500 animate-pulse">
                    <Volume2 size={16} />
                    <span className="text-[10px] font-black uppercase">جارِ القراءة...</span>
                  </div>
                )}
                <div className={`prose prose-blue prose-lg max-w-none text-gray-700 font-medium leading-[2] whitespace-pre-wrap text-right transition-all duration-300 ${isReading ? 'bg-indigo-50/50 p-6 rounded-2xl border-2 border-indigo-100' : ''}`}>
                  {previewPages[currentPage] || "عذراً، هذا الملخص لا يتوفر على معاينة نصية حالياً. يمكنك تحميل الملف كاملاً للاطلاع عليه."}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">مرات التحميل</span>
                  <span className="text-xl font-black text-gray-800">{(selectedPreview.downloads || 0).toLocaleString()}</span>
                </div>
                <div className="w-px h-10 bg-gray-100"></div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">حجم الملف</span>
                  <span className="text-xl font-black text-gray-800">{selectedPreview.fileSize || 'غير معروف'}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleShare(selectedPreview)}
                  className="p-4 bg-gray-50 text-gray-400 rounded-[1.5rem] hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100 shadow-sm"
                >
                  <Share2 size={24} />
                </button>
                <a 
                  href={selectedPreview.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerSound('success')}
                  className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
                >
                  تحميل الملخص PDF <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-white p-10 lg:p-14 rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden group">
        <div className="relative z-10 lg:flex items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black mb-6 border border-blue-100">
              <ShieldCheck size={14} /> بحث حصري في بنك الفروض والاختبارات dzexams
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-800 mb-6 leading-tight">
              خزانة <span className="text-blue-600">الملخصات</span> والامتحانات 📚
            </h1>
            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed opacity-90 mb-6">
              أدخل اسم الدرس، وسيقوم الذكاء الاصطناعي بجلب أفضل الملفات المتاحة على الإنترنت لشهادة البكالوريا.
            </p>
          </div>
          
          <div className="mt-10 lg:mt-0 flex-1 max-w-lg w-full">
            <div className="bg-gray-50 p-2 rounded-[2rem] shadow-inner border border-gray-100 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all flex items-center relative">
              <div className="relative flex-1 group/input">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" size={20} />
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="ابحث عن درس (مثال: الأعداد المركبة)..."
                  className="w-full pr-14 pl-12 py-5 bg-transparent border-none rounded-[1.5rem] outline-none font-bold text-lg text-gray-700 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                />
                {searchTerm && (
                  <button onClick={clearSearch} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                )}
              </div>
              <button 
                onClick={handleAiSearch}
                disabled={isAiSearching || !searchTerm.trim()}
                className="mr-2 bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isAiSearching ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              </button>
            </div>
            {searchError && (
              <div className="mt-4 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black flex items-center gap-2 border border-red-100 animate-slide-up">
                <AlertCircle size={16} /> {searchError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Section with Dropdown */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Stream Selector Dropdown */}
            <div className="relative" ref={streamDropdownRef}>
              <div className="flex items-center gap-3 px-4 mb-2">
                <GraduationCap className="text-blue-600" size={20} />
                <h3 className="font-black text-gray-800 text-sm">تصفية حسب الشعبة:</h3>
              </div>
              <button
                onClick={() => setIsStreamDropdownOpen(!isStreamDropdownOpen)}
                className="min-w-[220px] bg-white border-2 border-gray-100 px-6 py-4 rounded-[1.5rem] font-black text-sm text-gray-700 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all"
              >
                <span className="flex items-center gap-2">
                  {selectedStream === 'الكل' ? 'جميع الشعب' : selectedStream}
                </span>
                {isStreamDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isStreamDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-full bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl z-[105] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {allStreams.map(stream => (
                      <button
                        key={stream}
                        onClick={() => {
                          triggerSound();
                          setSelectedStream(stream);
                          setIsStreamDropdownOpen(false);
                        }}
                        className={`w-full text-right px-6 py-4 text-sm font-bold transition-all border-b border-gray-50 last:border-none flex items-center justify-between ${
                          selectedStream === stream 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {stream === 'الكل' ? 'جميع الشعب الدراسية' : stream}
                        {selectedStream === stream && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subject Selector (Dynamic based on stream) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 px-4 mb-2">
                <Layers className="text-blue-600" size={18} />
                <h3 className="font-black text-gray-800 text-sm">المادة:</h3>
              </div>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-white border-2 border-gray-100 px-6 py-4 rounded-[1.5rem] font-black text-sm text-gray-700 outline-none hover:border-blue-200 transition-all shadow-sm"
              >
                <option value="الكل">جميع المواد</option>
                {selectedStream !== 'الكل' && STREAM_SUBJECTS[selectedStream]?.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={() => { triggerSound(); setShowAdvanced(!showAdvanced); }}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
              showAdvanced ? 'bg-gray-800 text-white border-gray-800 shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {showAdvanced ? 'إخفاء الفلاتر' : 'فلاتر إضافية'} <Filter size={18} />
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-2xl animate-slide-up">
             <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                <ArrowUpDown size={14} className="text-blue-500" /> الترتيب حسب
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSortBy('downloads')} className={getFilterBtnClass(sortBy === 'downloads')}>الأكثر تحميلاً</button>
                <button onClick={() => setSortBy('rating')} className={getFilterBtnClass(sortBy === 'rating')}>الأعلى تقييماً</button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                <Clock size={14} className="text-blue-500" /> تاريخ النشر
              </label>
              <div className="flex flex-wrap gap-2">
                {['الكل', 'اليوم', 'هذا الأسبوع', 'هذا الشهر'].map((opt: any) => (
                  <button key={opt} onClick={() => setDateFilter(opt)} className={getFilterBtnClass(dateFilter === opt)}>{opt}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isAiSearching && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-spin-slow">
                <Loader2 size={48} />
              </div>
              <h3 className="text-3xl font-black text-gray-800">جاري مسح المصادر الخارجية...</h3>
              <p className="text-gray-400 mt-4 text-lg font-medium max-w-md mx-auto leading-relaxed italic">
                نقوم حالياً بالبحث في بنوك الفروض والاختبارات الجزائرية لتزويدك بالأفضل.
              </p>
            </div>
          </div>
        )}

        {filteredSummaries.length === 0 && !isAiSearching && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FileText size={48} />
             </div>
             <h3 className="text-2xl font-black text-gray-800">لا توجد نتائج تطابق بحثك</h3>
             <p className="text-gray-400 mt-3 font-bold">جرب تغيير الفلاتر أو استخدام ميزة البحث الذكي بالذكاء الاصطناعي.</p>
          </div>
        )}

        {filteredSummaries.map((summary: any) => (
          <div 
            key={summary.id} 
            className={`group relative bg-white rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all duration-500 overflow-hidden flex flex-col h-full ${summary.isDynamic ? 'border-indigo-200 ring-2 ring-indigo-50/50' : 'border-gray-100'}`}
          >
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 items-end">
              <span className={`px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black rounded-full border shadow-sm uppercase tracking-widest flex items-center gap-1.5 ${summary.isDynamic ? 'text-indigo-600 border-indigo-100' : 'text-gray-500 border-gray-100'}`}>
                <span className="text-xs">{getSubjectIcon(summary.subject)}</span>
                {summary.subject}
              </span>
              {summary.isDynamic && (
                <div className="flex flex-col gap-2 items-end">
                  {!dismissedAiTags.has(summary.id) && (
                    <div className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-700 text-white text-[9px] font-black rounded-full shadow-lg flex items-center gap-2 group/tag animate-in slide-in-from-right duration-300">
                      <Cpu size={10} className="animate-pulse" />
                      نتائج بحث ذكية AI
                      <button 
                        onClick={(e) => { e.stopPropagation(); dismissAiTag(summary.id); }}
                        className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full shadow-sm flex items-center gap-1">
                    <ShieldCheck size={10} /> بنك dzexams
                  </span>
                </div>
              )}
            </div>

            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className={`w-20 h-20 ${summary.color || 'bg-blue-600'} rounded-3xl flex items-center justify-center text-5xl text-white shadow-2xl transition-all duration-500 group-hover:rotate-6`}>
                  {summary.icon || '📄'}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-black">{summary.rating || '4.5'}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                {summary.title}
              </h3>
              <p className="text-sm text-gray-400 font-bold mb-6 flex items-center gap-2">
                <span>إعداد:</span>
                <span className="text-gray-700 underline decoration-blue-200 decoration-2 underline-offset-4">{summary.author || 'أستاذ المادة'}</span>
              </p>
            </div>

            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">مرات التحميل</span>
                <span className="text-lg font-black text-gray-800">
                  {summary.downloads >= 1000 ? `${(summary.downloads / 1000).toFixed(1)}k` : summary.downloads || '0'}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { triggerSound(); setSelectedPreview(summary); }}
                  className="flex items-center gap-2 bg-white text-gray-600 px-5 py-4 rounded-2xl font-black text-xs border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
                >
                  معاينة <Eye size={16} />
                </button>
                <a 
                  href={summary.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerSound('success')}
                  className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all"
                >
                  تحميل {summary.isDynamic ? <ExternalLink size={18} /> : <Download size={18} />}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summaries;
