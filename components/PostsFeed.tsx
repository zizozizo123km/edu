
import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Heart, Send, Edit2, X, Check, MoreHorizontal } from 'lucide-react';
import { Post, UserState } from '../types';
import { audioService } from '../services/audioService';
import { db, auth } from '../services/firebaseService';
import { ref, push, update, serverTimestamp } from "https://esm.sh/firebase@10.8.0/database";

interface PostsFeedProps {
  user: UserState;
  posts: Post[];
  onPostUpdate: (posts: Post[]) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ user, posts }) => {
  const [newContent, setNewContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  const handlePost = async () => {
    if (!newContent.trim()) return;
    const postsRef = ref(db, 'posts');
    const currentUser = auth.currentUser;
    await push(postsRef, {
      author: user.name,
      authorUid: currentUser?.uid || 'anonymous',
      time: "الآن",
      content: newContent,
      likes: 0,
      comments: 0,
      tag: "مشاركة",
      avatarSeed: user.avatarSeed,
      timestamp: serverTimestamp()
    });
    setNewContent('');
    audioService.playSuccess();
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    audioService.playClick();
  };

  const handleSaveEdit = async (postId: number | string) => {
    if (!editContent.trim()) return;
    const postRef = ref(db, `posts/${postId}`);
    await update(postRef, {
      content: editContent,
      isEdited: true
    });
    setEditingPostId(null);
    audioService.playSuccess();
  };

  const handleLike = async (post: Post) => {
    const postRef = ref(db, `posts/${post.id}`);
    await update(postRef, {
      likes: (post.likes || 0) + 1
    });
    audioService.playClick();
  };

  const handleAddComment = async (post: Post) => {
    const content = commentInputs[post.id];
    if (!content?.trim()) return;

    const commentRef = ref(db, `posts/${post.id}/commentsList`);
    await push(commentRef, {
      author: user.name,
      content: content.trim(),
      time: "الآن",
      avatarSeed: user.avatarSeed
    });

    const postRef = ref(db, `posts/${post.id}`);
    await update(postRef, {
      comments: (post.comments || 0) + 1
    });

    setCommentInputs({ ...commentInputs, [post.id]: '' });
    audioService.playSuccess();
  };

  const isOwner = (post: Post) => {
    return auth.currentUser?.uid === (post as any).authorUid;
  };

  return (
    <div className="space-y-8">
      {/* New Post Area */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100">
        <textarea 
          placeholder={`أهلاً ${user.name.split(' ')[0]}! شارك شيئاً مفيداً...`}
          className="w-full bg-gray-50 rounded-2xl p-6 outline-none focus:bg-white border-2 border-transparent focus:border-blue-100 min-h-[120px] resize-none font-bold text-right transition-all"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <button onClick={handlePost} disabled={!newContent.trim()} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center gap-2">
            انشر الآن <Send size={18} className="rotate-180" />
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-slide-up">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-md">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatarSeed}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-gray-900 flex items-center gap-2">
                      {post.author}
                      {isOwner(post) && <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">أنا</span>}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold">{post.time} {(post as any).isEdited && "• معدل"}</span>
                  </div>
                </div>
                
                {isOwner(post) && editingPostId !== post.id && (
                  <button onClick={() => handleStartEdit(post)} className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="px-8 py-4">
              {editingPostId === post.id ? (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <textarea 
                    className="w-full bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-200 outline-none font-bold text-gray-800 min-h-[100px] resize-none text-right"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingPostId(null)} className="px-5 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-black text-xs">إلغاء</button>
                    <button onClick={() => handleSaveEdit(post.id)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs flex items-center gap-2">
                      <Check size={14} /> حفظ التعديل
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-gray-800 font-medium leading-relaxed text-right whitespace-pre-wrap">{post.content}</p>
                </div>
              )}
            </div>

            <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-50">
              <div className="flex gap-6">
                <button onClick={() => handleLike(post)} className="flex items-center gap-2 text-rose-500 font-black hover:scale-110 transition-transform">
                  <Heart size={20} fill={(post.likes || 0) > 0 ? "currentColor" : "none"} /> {post.likes || 0}
                </button>
                <button onClick={() => setExpandedComments(prev => prev.includes(post.id) ? prev.filter(id => id !== post.id) : [...prev, post.id])} className="flex items-center gap-2 text-indigo-600 font-black">
                  <MessageSquare size={20} /> {post.comments || 0}
                </button>
              </div>
            </div>

            {expandedComments.includes(post.id) && (
              <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="اكتب تعليقاً..." 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-400 transition-all" 
                    value={commentInputs[post.id] || ''} 
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post)}
                  />
                  <button onClick={() => handleAddComment(post)} className="bg-blue-600 text-white p-2 rounded-xl shadow-lg active:scale-95"><Send size={18} className="rotate-180" /></button>
                </div>
                <div className="space-y-3">
                  {post.commentsList && Object.keys(post.commentsList).map((cid: any) => {
                    const c = (post.commentsList as any)[cid];
                    return (
                      <div key={cid} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in fade-in">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.avatarSeed}`} className="w-8 h-8 rounded-lg" />
                        <div className="flex-1 text-right">
                          <p className="text-[11px] font-black text-blue-600">{c.author}</p>
                          <p className="text-xs text-gray-700">{c.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsFeed;
