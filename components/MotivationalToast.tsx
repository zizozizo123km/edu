
import React, { useState, useEffect } from 'react';
import { Sparkles, X, Flame, Trophy, Star, Heart } from 'lucide-react';
import { audioService } from '../services/audioService';

const MOTIVATIONAL_MESSAGES = [
  "البكالوريا تقترب، وأنت تقترب من حلمك! واصل المراجعة يا بطل. 🚀",
  "تخيل فرحة والديك يوم النتائج.. تستحق كل هذا التعب. ❤️",
  "كل دقيقة مراجعة الآن هي خطوة نحو تخصص أحلامك في الجامعة. 🎓",
  "أنت بطل قصتك، والنجاح بانتظارك في جوان إن شاء الله. ✨",
  "التميز ليس صدفة، بل هو نتيجة مجهودك اليومي الصغير. واصل! 📈",
  "ثق في قدراتك، العقل الجزائري لا يعرف المستحيل! 🇩🇿💪",
  "نظم وقتك، خذ نفساً عميقاً، وأكمل.. أنت تقوم بعمل رائع حقاً. 🧘‍♂️",
  "ما بقاش قد اللي فات، العزيمة هي اللي تصنع الفارق الآن! 🔥",
  "تذكر: التعب يزول، والنجاح يبقى للأبد. 🏆",
  "أنت لست وحدك، آلاف الطلاب يشاركونك نفس الطموح. تميز عنهم بصبرك! 🌟"
];

const MotivationalToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [icon, setIcon] = useState<React.ReactNode>(<Sparkles />);

  const icons = [
    <Sparkles className="text-amber-400" />,
    <Flame className="text-orange-500" />,
    <Trophy className="text-yellow-500" />,
    <Star className="text-blue-400" />,
    <Heart className="text-rose-500" />
  ];

  const showNotification = () => {
    const randomMsg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    setCurrentMessage(randomMsg);
    setIcon(randomIcon);
    setIsVisible(true);
    audioService.playSuccess();

    // إخفاء الإشعار تلقائياً بعد 10 ثوانٍ
    setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  };

  useEffect(() => {
    // إظهار أول إشعار بعد دقيقة واحدة من دخول التطبيق
    const initialTimeout = setTimeout(showNotification, 60000);

    // ضبط المؤقت ليظهر كل 5 دقائق (300,000ms)
    const interval = setInterval(showNotification, 300000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-md animate-in slide-in-from-top-full duration-500">
      <div className="bg-white/80 backdrop-blur-2xl border border-blue-100 shadow-2xl rounded-[2rem] p-5 md:p-6 flex items-center gap-4 relative overflow-hidden">
        {/* Progress bar for auto-hide */}
        <div className="absolute bottom-0 right-0 h-1 bg-blue-600/20 animate-[shrink_10s_linear_forwards]"></div>
        
        <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          {icon}
        </div>
        
        <div className="flex-1 text-right">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">جرعة تحفيزية ✨</p>
          <p className="text-xs md:text-sm font-black text-gray-800 leading-relaxed">
            {currentMessage}
          </p>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-300"
        >
          <X size={18} />
        </button>

        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-400/5 rounded-full blur-xl"></div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default MotivationalToast;
