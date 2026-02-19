
import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Heart, 
  Sparkles,
  ChevronDown,
  User,
  Loader2
} from 'lucide-react';
import { ref, onValue, push, serverTimestamp, update, get } from "firebase/database";
import { db } from '../services/firebase.ts';
import { Post, UserState, PostComment } from '../types';
import { audioService } from '../services/audioService';

interface PostsFeedProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ user, posts, onPostUpdate }) => {
  const [newContent, setNewContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});

  useEffect(() => {
    const postsRef = ref(db, 'community_posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList: Post[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          commentsList: data[key].commentsList ? Object.values(data[key].commentsList) : []
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onPostUpdate(postList);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    const postsRef = ref(db, 'community_posts');
    
    const newPostData = {
      author: user.name,
      uid: user.uid,
      time: "الآن",
      createdAt: serverTimestamp(),
      content: newContent,
      likes: 0,
      comments: 0,
      tag: "مشاركة جديدة",
      avatarSeed: user.uid || user.name
    };

    try {
      await push(postsRef, newPostData);
      setNewContent('');
      audioService.playSuccess();
    } catch (error) {
      console.error("Failed to post:", error);
    }
  };

  const handleLike = async (postId: string | number) => {
    const postRef = ref(db, `community_posts/${postId}`);
    try {
      const snapshot = await get(postRef);
      if (snapshot.exists()) {
        const currentLikes = snapshot.val().likes || 0;
        await update(postRef, { likes: currentLikes + 1 });
        audioService.playClick();
      }
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const toggleComments = (postId: any) => {
    const id = Number(postId) || postId;
    setExpandedComments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddComment = async (postId: string | number) => {
    const content = commentInputs[postId as any];
    if (!content || !content.trim()) return;

    const commentsRef = ref(db, `community_posts/${postId}/commentsList`);
    const postRef = ref(db, `community_posts/${postId}`);

    const newComment = {
      uid: user.uid,
      author: user.name,
      content: content.trim(),
      time: "الآن",
      createdAt: serverTimestamp(),
      avatarSeed: user.uid || user.name
    };

    try {
      await push(commentsRef, newComment);
      const snapshot = await get(postRef);
      if (snapshot.exists()) {
        const currentCount = snapshot.val().comments || 0;
        await update(postRef, { comments: currentCount + 1 });
      }
      setCommentInputs(prev => ({ ...prev, [postId as any]: '' }));
      audioService.playSuccess();
    } catch (error) {
      console.error("Failed to comment:", error);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className={`
        bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 relative
        ${isFocused ? 'shadow-2xl shadow-indigo-100 border-indigo-200 translate-y-[-4px]' : 'shadow-xl shadow-blue-50 border-gray-100'}
      `}>
        <div className="flex gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl shadow-indigo-100 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea 
              placeholder={`أهلاً ${user.name.split(' ')[0]}! شارك شيئاً مفيداً...`}
              className="w-full bg-gray-50/50 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 text-sm md:text-base outline-none border-2 border-transparent focus:border-indigo-50 focus:bg-white min-h-[120px] resize-none font-bold text-right transition-all"
              value={newContent}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setNewContent(e.target.value)}
            ></textarea>
            
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all font-black text-[10px] border border-transparent">
                  <ImageIcon size={16} /> صورة
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-black text-[10px] border border-transparent">
                  <FileText size={16} /> ملف
                </button>
              </div>
              
              <button 
                onClick={handlePost}
                disabled={!newContent.trim()}
                className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                انشر الآن <Send size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
        {isFocused && (
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce-slow">
            <Sparkles size={20} />
          </div>
        )}
      </div>

      <div className="space-y-6 md:space-y-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">لا توجد منشورات حالياً. ابدأ النقاش!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="group bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-xl shadow-blue-50/30 overflow-hidden animate-slide-up">
              <div className="p-6 md:p-10 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gray-100 border-2 border-white shadow-md overflow-hidden shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatarSeed}`} alt={post.author} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-gray-900 text-sm md:text-lg group-hover:text-indigo-600 transition-colors">{post.author}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400 font-black">{post.time}</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full border border-indigo-100/50">
                          {post.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600 p-2">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              <div className="px-6 md:p-10 pb-6">
                <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-50">
                  <p className="text-gray-800 text-sm md:text-lg leading-[1.7] text-right font-medium whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </div>

              <div className="px-6 md:px-10 py-4 md:py-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-all ${post.isLiked ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-rose-500'}`}
                  >
                    <div className={`p-2.5 md:p-3 rounded-xl shadow-sm transition-all ${post.isLiked ? 'bg-rose-50 shadow-rose-100' : 'bg-white'}`}>
                      <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
                    </div>
                    <span className="text-xs md:text-sm font-black">{post.likes}</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-2 transition-all ${expandedComments.includes(post.id as any) ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                  >
                    <div className={`p-2.5 md:p-3 rounded-xl shadow-sm transition-all ${expandedComments.includes(post.id as any) ? 'bg-indigo-50 shadow-indigo-100' : 'bg-white'}`}>
                      <MessageSquare size={18} />
                    </div>
                    <span className="text-xs md:text-sm font-black">{post.comments}</span>
                  </button>
                </div>

                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all">
                  <div className="p-2.5 md:p-3 bg-white shadow-sm rounded-xl">
                    <Share2 size={18} />
                  </div>
                </button>
              </div>

              {expandedComments.includes(post.id as any) && (
                <div className="px-6 md:px-10 pb-8 pt-4 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top duration-300">
                  <div className="flex gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                      <User size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="اكتب تعليقاً..."
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all shadow-sm"
                        value={commentInputs[post.id as any] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id as any]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
                      >
                        <Send size={18} className="rotate-180" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                    {post.commentsList && post.commentsList.length > 0 ? (
                      post.commentsList.map((comment, cIdx) => (
                        <div key={comment.id || cIdx} className="flex gap-3 animate-in fade-in slide-in-from-right duration-300">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm shrink-0 border border-gray-100">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.avatarSeed}`} alt={comment.author} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 bg-white p-4 rounded-[1.25rem] border border-gray-100 shadow-sm">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-black text-[11px] text-gray-800">{comment.author}</span>
                                <span className="text-[9px] text-gray-400 font-bold">{comment.time}</span>
                             </div>
                             <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-xs font-bold bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        لا توجد تعليقات بعد. كن أول من يعلق!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostsFeed;
