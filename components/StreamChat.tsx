
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, ShieldCheck, Sparkles, MessageCircle, MoreVertical, Hash, Info, UserCheck, Loader2 } from 'lucide-react';
import { ref, onValue, push, serverTimestamp, query, limitToLast } from "firebase/database";
import { db } from '../services/firebase.ts';
import { StreamMessage, UserState } from '../types';
import { audioService } from '../services/audioService';

interface StreamChatProps {
  user: UserState;
}

const StreamChat: React.FC<StreamChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    // Sanitize stream name for Firebase path
    const streamPath = (user.stream || 'general').replace(/\s+/g, '_');
    const messagesRef = query(ref(db, `chats/${streamPath}`), limitToLast(50));

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList: StreamMessage[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          isMe: data[key].uid === user.uid
        }));
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user.stream, user.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const streamPath = (user.stream || 'general').replace(/\s+/g, '_');
    const messagesRef = ref(db, `chats/${streamPath}`);

    const newMessage = {
      uid: user.uid,
      sender: user.name,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
      avatarSeed: user.avatarSeed || user.name
    };

    try {
      await push(messagesRef, newMessage);
      setInputValue('');
      audioService.playClick();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden animate-slide-up">
      <div className="px-6 md:px-10 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <Hash size={24} />
          </div>
          <div>
            <h3 className="font-black text-base md:text-xl">دردشة شعبة {user.stream || 'العامة'}</h3>
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-blue-100">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              {messages.length > 0 ? `${messages.length * 3} طالب يراجعون الآن` : 'ابدأ النقاش الآن'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
           <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-xs font-black">
             <Users size={16} /> الأعضاء
           </button>
           <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><MoreVertical size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 custom-scrollbar bg-[#F8FAFC]">
        <div className="flex flex-col items-center mb-10">
           <div className="px-6 py-2.5 bg-white shadow-sm text-blue-600 rounded-full text-[10px] md:text-xs font-black border border-blue-50 uppercase tracking-widest mb-4 flex items-center gap-2">
             <ShieldCheck size={14} /> غرفتك الدراسية الآمنة
           </div>
           <p className="text-gray-400 text-[11px] md:text-sm font-medium text-center max-w-sm leading-relaxed">
             أهلاً بك في فضاء طلاب {user.stream || 'دزاير إيدو'}. تبادل الأسئلة، الحلول، والتحفيز مع زملائك من كل ولايات الوطن.
           </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="mx-auto text-gray-200 mb-4" size={60} />
            <p className="text-gray-400 font-bold">لا توجد رسائل بعد. كن أول من يكتب!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 md:gap-5 ${msg.isMe ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
              <div className="shrink-0 pt-1">
                <div className={`w-9 h-9 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 transition-transform hover:scale-110 ${msg.isMe ? 'border-blue-500' : 'border-white'} shadow-md`}>
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} 
                    alt={msg.sender} 
                    className="w-full h-full object-cover bg-gray-100"
                  />
                </div>
              </div>
              
              <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                {!msg.isMe && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[11px] md:text-xs font-black text-gray-800">{msg.sender}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[8px] font-black rounded-full border border-blue-100 uppercase">طالب</span>
                  </div>
                )}
                <div className={`px-5 py-3.5 md:px-6 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-[13px] md:text-[16px] font-medium leading-relaxed shadow-sm border ${
                  msg.isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none border-blue-500 shadow-blue-100' 
                    : 'bg-white text-gray-800 rounded-tl-none border-gray-100'
                }`}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-[9px] md:text-[10px] text-gray-400 font-bold">{msg.timestamp}</span>
                  {msg.isMe && <span className="text-blue-500 text-[8px] font-black">تم الإرسال</span>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-8 bg-white border-t border-gray-100 shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 bg-gray-50 p-2 md:p-3 rounded-2xl md:rounded-[2.5rem] border border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner">
          <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
            <Sparkles size={20} />
          </button>
          <input 
            type="text" 
            placeholder="اكتب رسالة لزملائك في الشعبة..." 
            className="flex-1 bg-transparent border-none px-2 md:px-4 py-3 text-[13px] md:text-base outline-none font-bold text-right"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all disabled:opacity-50 active:scale-95 group"
          >
            <Send size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
        <p className="text-center text-[8px] md:text-[10px] text-gray-300 font-bold mt-3 uppercase tracking-widest hidden md:block">
          التزم بقواعد الاحترام المتبادل لضمان استمرارية حسابك
        </p>
      </div>
    </div>
  );
};

export default StreamChat;
