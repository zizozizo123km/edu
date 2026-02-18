
import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Send, Image as ImageIcon, FileText, Heart, Sparkles } from 'lucide-react';
import { Post, UserState } from '../types';

interface PostsFeedProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ user, posts, onPostUpdate }) => {
  const [newContent, setNewContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handlePost = () => {
    if (!newContent.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      author: user.name,
      time: "الآن",
      content: newContent,
      likes: 0,
      comments: 0,
      tag: "مشاركة جديدة",
      avatarSeed: user.name
    };
    onPostUpdate([newPost, ...posts]);
    setNewContent('');
  };

  return (
    <div className="space-y-10">
      {/* Revolutionary Create Post Box */}
      <div className={`
        bg-white p-8 rounded-[3rem] border transition-all duration-500 relative
        ${isFocused ? 'shadow-2xl shadow-indigo-100 border-indigo-200 translate-y-[-4px]' : 'shadow-xl shadow-blue-50 border-gray-100'}
      `}>
        <div className="flex gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea 
              placeholder={`أهلاً ${user.name.split(' ')[0]}! شارك شيئاً مفيداً مع زملائك...`}
              className="w-full bg-gray-50/50 rounded-[2rem] p-6 text-base outline-none border-2 border-transparent focus:border-indigo-50 focus:bg-white min-h-[140px] resize-none font-bold text-right transition-all"
              value={newContent}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setNewContent(e.target.value)}
            ></textarea>
            
            <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
              <div className="flex gap-3">
                <button className="flex items-center gap-2.5 px-5 py-2.5 bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all font-black text-[11px] border border-transparent hover:border-indigo-100">
                  <ImageIcon size={18} /> إضافة صورة
                </button>
                <button className="flex items-center gap-2.5 px-5 py-2.5 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all font-black text-[11px] border border-transparent hover:border-blue-100">
                  <FileText size={18} /> ملف PDF
                </button>
              </div>
              
              <button 
                onClick={handlePost}
                disabled={!newContent.trim()}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
              >
                انشر في الساحة <Send size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
        {isFocused && (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce-slow">
            <Sparkles size={24} />
          </div>
        )}
      </div>

      {/* Modern Posts List */}
      <div className="space-y-10">
        {posts.map(post => (
          <div key={post.id} className="group bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-blue-50/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/40 hover:translate-y-[-5px] overflow-hidden animate-slide-up">
            {/* Post Header */}
            <div className="p-8 lg:p-10 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-5 items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-white shadow-md overflow-hidden transition-transform group-hover:scale-110">
                      <img src={`https://picsum.photos/seed/${post.avatarSeed}/150/150`} alt={post.author} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{post.author}</h4>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-[11px] text-gray-400 font-black">{post.time}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100/50 uppercase tracking-tighter">
                        {post.tag}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-gray-600 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                  <MoreHorizontal size={22} />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-8 lg:px-10 pb-8">
              <div className="bg-gray-50/30 p-8 rounded-[2.5rem] border border-gray-50 group-hover:bg-indigo-50/10 transition-colors">
                <p className="text-gray-800 text-lg leading-[1.8] text-right font-medium whitespace-pre-wrap selection:bg-indigo-100">
                  {post.content}
                </p>
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-8 lg:px-10 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-6 lg:gap-10">
                <button className="flex items-center gap-3 text-gray-400 hover:text-rose-500 transition-all group/btn">
                  <div className="p-3 bg-white shadow-sm rounded-2xl group-hover/btn:bg-rose-50 group-hover/btn:shadow-rose-100 group-hover/btn:scale-110 transition-all">
                    <Heart size={20} className="group-hover/btn:fill-rose-500" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-black text-gray-800">{post.likes}</span>
                    <span className="text-[10px] font-bold">إعجاب</span>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 text-gray-400 hover:text-indigo-600 transition-all group/btn">
                  <div className="p-3 bg-white shadow-sm rounded-2xl group-hover/btn:bg-indigo-50 group-hover/btn:shadow-indigo-100 group-hover/btn:scale-110 transition-all">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-black text-gray-800">{post.comments}</span>
                    <span className="text-[10px] font-bold">تعليق</span>
                  </div>
                </button>
              </div>

              <button className="flex items-center gap-3 text-gray-400 hover:text-blue-600 transition-all group/btn">
                <div className="p-3 bg-white shadow-sm rounded-2xl group-hover/btn:bg-blue-50 group-hover/btn:shadow-blue-100 group-hover/btn:scale-110 transition-all">
                  <Share2 size={20} />
                </div>
                <span className="hidden md:inline text-[11px] font-black">مشاركة المنشور</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
            <MessageSquare size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-800">الساحة هادئة جداً اليوم</h3>
          <p className="text-gray-400 mt-3 font-bold">كن أول من يكسر الصمت ويشارك زملاءه فائدة!</p>
        </div>
      )}
    </div>
  );
};

export default PostsFeed;
