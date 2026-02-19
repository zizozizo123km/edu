
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, ShieldCheck, Hash, MoreVertical } from 'lucide-react';
import { StreamMessage, UserState } from '../types';
import { audioService } from '../services/audioService';
import { db } from '../services/firebaseService';
import { ref, push, onValue, limitToLast, query } from 'firebase/database';

interface StreamChatProps {
  user: UserState;
}

const StreamChat: React.FC<StreamChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user.stream) return;
    
    // تنظيف اسم الشعبة ليكون مساراً صالحاً
    const streamPath = user.stream.replace(/\s+/g, '_');
    const chatRef = query(ref(db, `chats/${streamPath}`), limitToLast(50));

    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgList = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          isMe: data[key].senderUid === (user as any).uid
        }));
        setMessages(msgList);
      }
    });

    return () => unsubscribe();
  }, [user.stream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const streamPath = user.stream.replace(/\s+/g, '_');
    const chatRef = ref(db, `chats/${streamPath}`);

    const newMessage = {
      sender: user.name,
      senderUid: (user as any).uid || 'anon',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      avatarSeed: user.avatarSeed || user.name
    };

    try {
      await push(chatRef, newMessage);
      setInputValue('');
      audioService.playClick();
    } catch (err) {
      console.error("Chat failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden rounded-[2rem] border border-gray-100">
      <div className="px-6 py-5 bg-blue-600 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
            <Hash size={24} />
          </div>
          <div>
            <h3 className="font-black text-base">دردشة شعبة {user.stream}</h3>
            <span className="text-[10px] text-blue-100">تواصل مباشر مع زملائك</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} className="w-full h-full bg-gray-100" />
              </div>
            </div>
            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
              <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm border ${msg.isMe ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'}`}>
                {msg.content}
              </div>
              <span className="text-[9px] text-gray-400 mt-1">{msg.sender} • {msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200">
          <input 
            type="text" 
            placeholder="اكتب رسالة..." 
            className="flex-1 bg-transparent border-none px-4 py-2 outline-none font-bold text-right text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={!inputValue.trim()} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg disabled:opacity-50">
            <Send size={18} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamChat;
