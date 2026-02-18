
import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, X, ChevronLeft, Loader2, User, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, UserState } from '../types';

interface AiAssistantProps {
  onClose: () => void;
  user: UserState;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onClose, user }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{ text: `أهلاً بك يا ${user.name.split(' ')[0]}! أنا مساعدك الذكي في منصة دزاير إيدو. راني هنا باش نعاونك في دروس البكالوريا وفهم أي تمرين يجيك صعيب. واش راك حاب تراجع اليوم؟` }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let fullResponse = "";
      const assistantMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
      setMessages(prev => [...prev, assistantMessage]);

      const stream = geminiService.streamChat(input, messages);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.parts[0].text = fullResponse;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex justify-end animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 overflow-hidden rounded-r-[2.5rem]">
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight uppercase flex items-center gap-2">
                مساعد الذكاء الاصطناعي <Sparkles size={16} className="text-blue-200" />
              </h4>
              <p className="text-[11px] text-blue-100 font-bold uppercase tracking-widest opacity-80">برعاية Gemini 2.0 Pro</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 hover:bg-white/10 p-3 rounded-2xl transition-all border border-transparent hover:border-white/20"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar bg-gray-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-sm border ${msg.role === 'model' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-100'}`}>
                {msg.role === 'model' ? <BrainCircuit size={18} /> : <User size={18} />}
              </div>
              <div className={`max-w-[85%] p-5 rounded-3xl text-[14.5px] font-medium leading-relaxed shadow-sm border ${
                msg.role === 'model' 
                  ? 'bg-white rounded-tr-none text-gray-800 border-gray-100' 
                  : 'bg-blue-600 rounded-tl-none text-white border-blue-500'
              }`}>
                {msg.parts[0].text || (isLoading && idx === messages.length - 1 ? <Loader2 className="animate-spin" size={18} /> : '')}
                {msg.role === 'model' && idx === 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["شرح درس الميكانيك", "ملخص وحدة المناعة", "كيفية كتابة مقال فلسفي"].map(tip => (
                      <button 
                        key={tip}
                        onClick={() => setInput(tip)}
                        className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-black border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        {tip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex gap-4 animate-pulse">
               <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
               <div className="bg-gray-200 h-12 w-3/4 rounded-2xl rounded-tr-none"></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-[1.5rem] border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اطرح سؤالك في أي مادة..." 
              className="flex-1 bg-transparent border-none px-5 py-3 text-sm outline-none font-bold text-right"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={20} className="rotate-180" />
            </button>
          </div>
          <p className="text-[9px] text-gray-400 text-center mt-4 font-bold uppercase tracking-widest">مساعد DzairEdu Pro لا يحل محل أستاذك، لكنه رفيق ذكي لمراجعتك</p>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
