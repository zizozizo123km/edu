
import React, { useState } from 'react';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, Send, 
  Image as ImageIcon, FileText, Heart, Sparkles, User
} from 'lucide-react';
import { Post, UserState } from '../types';
import { audioService } from '../services/audioService';
import { db } from '../services/firebaseService';
import { ref, push, update, remove } from 'firebase/database';

interface PostsFeedProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ user, posts }) => {
  const [newContent, setNewContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    
    const postsRef = ref(db, 'posts');
    const newPost = {
      author: user.name,
      authorUid: (user as any).uid || 'anonymous',
      time: new Date().toLocaleString('ar-DZ'),
      content: newContent,
      likes: 0,
      comments: 0,
      tag: "مشاركة طالب",
      avatarSeed: user.avatarSeed || user.name,
      timestamp: Date.now()
    };

    try {
      await push(postsRef, newPost);
      setNewContent('');
      audioService.playSuccess();
    } catch (err) {
      console.error("Post failed", err);
    }
  };

  const handleLike = async (postId: any, currentLikes: number) => {
    const postRef = ref(db, `posts/${postId}`);
    await update(postRef, { likes: currentLikes + 1 });
    audioService.playClick();
  };

  return (
    <div className="space-y-8 pb-10">
      <div className={`bg-white p-6 rounded-[2.5rem] border transition-all ${isFocused ? 'shadow-2xl border-indigo-200' : 'shadow-xl border-gray-100'}`}>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}`} className="w-full h-full rounded-xl" />
          </div>
          <div className="flex-1">
            <textarea 
              placeholder="شارك شيئاً مفيداً مع زملائك..."
              className="w-full bg-gray-50 rounded-2xl p-4 min-h-[100px] outline-none font-bold text-right"
              value={newContent}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setNewContent(e.target.value)}
            ></textarea>
            <div className="flex justify-between mt-4">
              <button onClick={handlePost} disabled={!newContent.trim()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg disabled:opacity-50">انشر الآن</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex gap-4 items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatarSeed}`} className="w-full h-full object-cover" />
                </div>
                <div className="text-right">
                  <h4 className="font-black text-gray-900 text-sm">{post.author}</h4>
                  <span className="text-[10px] text-gray-400 font-black">{post.time}</span>
                </div>
              </div>
              <p className="text-gray-800 text-sm font-medium leading-relaxed mb-6">{post.content}</p>
              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                <button onClick={() => handleLike(post.id, post.likes)} className="flex items-center gap-2 text-rose-500 font-black text-xs">
                  <Heart size={18} /> {post.likes}
                </button>
                <button className="flex items-center gap-2 text-indigo-600 font-black text-xs">
                  <MessageSquare size={18} /> {post.comments}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsFeed;
