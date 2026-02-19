
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, ShieldCheck, Hash, MoreVertical } from 'lucide-react';
import { StreamMessage, UserState } from '../types';
import { audioService } from '../services/audioService';
import { db } from '../services/firebaseService';
import { ref, push, onValue, off, serverTimestamp } from "https://esm.sh/firebase@10.8.0/database";

interface StreamChatProps {
  user: UserState;
}

const StreamChat: React.FC<StreamChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const streamKey = user.stream.replace(/ /g, '_');

  useEffect(() => {
    const chatRef = ref(db, `chats/${streamKey}`);
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          isMe: data[key].senderUid === (user as any).uid || data[key].sender === user.name
        }));
        setMessages(msgArray);
      }
    });

    return () => off(chatRef);
  }, [user.stream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const chatRef = ref(db, `chats/${streamKey}`);
    await push(chatRef, {
      sender: user.name,
      senderUid: (user as any).uid || user.name,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      avatarSeed: user.avatarSeed,
      createdAt: serverTimestamp()
    });

    setInputValue('');
    audioService.playClick();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden animate-slide-up rounded-3xl shadow-xl">
      <div className="px-8 py-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20"><Hash size={24} /></div>
          <div>
            <h3 className="font-black text-lg">دردشة {user.stream}</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-100">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> طلاب متصلون
            </div>
          </div>
        </div>
        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><MoreVertical size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50">
        <div className="flex flex-col items-center mb-10 text-center">
           <div className="px-4 py-2 bg-white text-blue-600 rounded-full text-[10px] font-black border border-blue-50 flex items-center gap-2 mb-4">
             <ShieldCheck size={14} /> فضاء آمن للتعاون
           </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''} animate-in fade-in`}>
            <div className="shrink-0">
              <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${msg.isMe ? 'border-blue-500' : 'border-white'} shadow-md`}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} className="w-full h-full object-cover bg-gray-100" />
              </div>
            </div>
            
            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
              <span className="text-[11px] font-black text-gray-500 mb-1 px-1">{msg.sender}</span>
              <div className={`px-5 py-3 rounded-2xl text-[14px] font-medium leading-relaxed shadow-sm border ${
                msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border-gray-100'
              }`}>
                {msg.content}
              </div>
              <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[1.5rem] border border-gray-200 focus-within:bg-white focus-within:border-blue-500 transition-all">
          <input 
            type="text" 
            placeholder="اكتب رسالة..." 
            className="flex-1 bg-transparent border-none px-4 py-3 outline-none font-bold text-right"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={!inputValue.trim()} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50">
            <Send size={20} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamChat;
