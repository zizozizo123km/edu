
import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, MoreVertical, Loader2 } from 'lucide-react';
import { StreamMessage, UserState } from '../types';
import { audioService } from '../services/audioService';
import { db, auth } from '../services/firebaseService';
import { ref, push, onValue, limitToLast, query, serverTimestamp } from 'firebase/database';

interface StreamChatProps {
  user: UserState;
}

const StreamChat: React.FC<StreamChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user.stream) return;
    
    // تنظيف اسم الشعبة ليكون مساراً صالحاً في قاعدة البيانات
    const streamPath = user.stream.replace(/\s+/g, '_');
    const chatRef = query(ref(db, `chats/${streamPath}`), limitToLast(100));

    const unsubscribe = onValue(chatRef, (snapshot) => {
      setIsLoading(false);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgList = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          isMe: data[key].senderUid === auth.currentUser?.uid
        }));
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [user.stream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !auth.currentUser) return;

    const streamPath = user.stream.replace(/\s+/g, '_');
    const chatRef = ref(db, `chats/${streamPath}`);

    const newMessage = {
      sender: user.name,
      senderUid: auth.currentUser.uid,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
      avatarSeed: user.avatarSeed || user.name
    };

    try {
      setInputValue(''); // تفريغ الحقل فوراً لتجربة مستخدم أفضل
      await push(chatRef, newMessage);
      audioService.playClick();
    } catch (err) {
      console.error("Chat push failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm">
      <div className="px-6 py-5 bg-blue-600 text-white flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
            <Hash size={24} />
          </div>
          <div>
            <h3 className="font-black text-base">دردشة شعبة {user.stream}</h3>
            <span className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">تواصل مباشر وآمن</span>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-xl"><MoreVertical size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-xs font-black">جاري جلب المحادثات...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center p-10">
            <Hash size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-black text-slate-400">لا توجد رسائل بعد في هذه الشعبة.</p>
            <p className="text-[10px] font-bold mt-1">كن أول من يحيي زملائه! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''} animate-slide-up`}>
              <div className="shrink-0 self-end">
                <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-blue-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} className="w-full h-full" alt="avatar" />
                </div>
              </div>
              <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                {!msg.isMe && <span className="text-[10px] font-black text-slate-400 mb-1 mr-1">{msg.sender}</span>}
                <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm border ${
                  msg.isMe 
                    ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                    : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <input 
            type="text" 
            placeholder="اكتب رسالة لزملائك..." 
            className="flex-1 bg-transparent border-none px-4 py-2 outline-none font-bold text-right text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim()} 
            className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={18} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamChat;
