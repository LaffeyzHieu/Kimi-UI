import { useState, useRef, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  ImagePlus,
  X,
  Send,
  Trash2,
  AtSign,
  Hash,
  Home,
  Search,
  Bell,
  User,
  MoreHorizontal,
  Link as LinkIcon,
  ChevronLeft
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

/* ─── Types ─── */
interface Thread {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  images: string[];
  likes: number;
  replies: Reply[];
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  timestamp: string;
  isCurrentUser: boolean;
}

interface Reply {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
}

/* ─── Helpers ─── */
const generateId = () => Math.random().toString(36).slice(2, 9);

const timeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const mockThreads: Thread[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    handle: '@sarahchen',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    content: 'Just shipped a new feature! The feeling of pushing code to production never gets old 🚀\n\nWhat are you working on this weekend?',
    images: [],
    likes: 42,
    replies: [
      {
        id: 'r1',
        author: 'Alex Rivera',
        handle: '@arivera',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        content: 'Congrats! Working on a side project with Rust.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    reposts: 5,
    isLiked: false,
    isReposted: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isCurrentUser: false
  },
  {
    id: '2',
    author: 'Marcus Johnson',
    handle: '@mjohnson',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    content: 'Golden hour hits different when you\'re coding on a rooftop. Views + vibes = maximum productivity',
    images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop'],
    likes: 128,
    replies: [],
    reposts: 12,
    isLiked: true,
    isReposted: false,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    isCurrentUser: false
  },
  {
    id: '3',
    author: 'Emma Watson',
    handle: '@emmaw',
    avatar: 'https://i.pravatar.cc/150?u=emma',
    content: 'Design tip: whitespace is not empty space. It\'s active space. It\'s a design element with as much power as any other.',
    images: [],
    likes: 256,
    replies: [
      {
        id: 'r2',
        author: 'David Park',
        handle: '@dpark',
        avatar: 'https://i.pravatar.cc/150?u=david',
        content: 'This! So many people underestimate negative space.',
        timestamp: new Date(Date.now() - 5400000).toISOString()
      },
      {
        id: 'r3',
        author: 'Lisa Kim',
        handle: '@lkim',
        avatar: 'https://i.pravatar.cc/150?u=lisa',
        content: 'Saved this for my next design review argument 😄',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    reposts: 34,
    isLiked: false,
    isReposted: true,
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    isCurrentUser: false
  }
];

/* ─── Avatar ─── */
function Avatar({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0 bg-[#2f3336]"
      style={{ width: size, height: size }}
    />
  );
}

/* ─── Image Grid ─── */
function ImageGrid({ images, onRemove }: { images: string[]; onRemove?: (i: number) => void }) {
  if (images.length === 0) return null;
  const gridClass =
    images.length === 1
      ? 'grid-cols-1'
      : images.length === 2
      ? 'grid-cols-2'
      : images.length === 3
      ? 'grid-cols-2'
      : 'grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-2 mt-3 rounded-xl overflow-hidden`}>
      {images.map((img, i) => (
        <div
          key={i}
          className={`relative group ${images.length === 3 && i === 0 ? 'row-span-2' : ''}`}
        >
          <img
            src={img}
            alt="Thread image"
            className="w-full h-full object-cover max-h-[400px] rounded-xl"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Thread Card ─── */
function ThreadCard({
  thread,
  onLike,
  onReplyClick,
  onRepost,
  onShare,
  onDelete
}: {
  thread: Thread;
  onLike: (id: string) => void;
  onReplyClick: (thread: Thread) => void;
  onRepost: (id: string) => void;
  onShare: (content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    if (!thread.isLiked) {
      setHeartAnimating(true);
      setTimeout(() => setHeartAnimating(false), 400);
    }
    onLike(thread.id);
  };

  return (
    <article className="border-b border-[#2f3336] px-4 py-4 hover:bg-[#0f0f0f] transition-colors animate-fade-in-slide">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <Avatar src={thread.avatar} alt={thread.author} />
          {thread.replies.length > 0 && (
            <div className="w-0.5 flex-1 bg-[#2f3336] my-1" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-white truncate">{thread.author}</span>
              <span className="text-[#717375] text-sm truncate">{thread.handle}</span>
              <span className="text-[#717375] text-sm">·</span>
              <span className="text-[#717375] text-sm">{timeAgo(thread.timestamp)}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <MoreHorizontal size={16} className="text-[#717375]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[#181818] border border-[#2f3336] rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                  {thread.isCurrentUser && (
                    <button
                      onClick={() => {
                        onDelete(thread.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/5 flex items-center gap-2 text-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onShare(thread.content);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-white hover:bg-white/5 flex items-center gap-2 text-sm"
                  >
                    <LinkIcon size={14} /> Copy link
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-white mt-1 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
          <ImageGrid images={thread.images} />

          {/* Action bar */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button
              onClick={() => onReplyClick(thread)}
              className="flex items-center gap-2 text-[#717375] hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
            >
              <MessageCircle size={18} />
              {thread.replies.length > 0 && <span className="text-sm">{thread.replies.length}</span>}
            </button>

            <button
              onClick={() => onRepost(thread.id)}
              className={`flex items-center gap-2 transition-colors p-2 rounded-full hover:bg-white/10 ${
                thread.isReposted ? 'text-green-400' : 'text-[#717375] hover:text-green-400'
              }`}
            >
              <Repeat2 size={18} className={thread.isReposted ? 'animate-spin-once' : ''} />
              {thread.reposts > 0 && <span className="text-sm">{thread.reposts}</span>}
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors p-2 rounded-full hover:bg-white/10 ${
                thread.isLiked ? 'text-red-400' : 'text-[#717375] hover:text-red-400'
              }`}
            >
              <Heart
                size={18}
                className={heartAnimating ? 'animate-heart-pulse' : ''}
                fill={thread.isLiked ? 'currentColor' : 'none'}
              />
              {thread.likes > 0 && <span className="text-sm">{thread.likes}</span>}
            </button>

            <button
              onClick={() => onShare(thread.content)}
              className="flex items-center gap-2 text-[#717375] hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <Share size={18} />
            </button>
          </div>

          {/* Reply previews */}
          {thread.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {thread.replies.slice(0, 2).map((reply) => (
                <div key={reply.id} className="flex gap-2 items-start">
                  <Avatar src={reply.avatar} alt={reply.author} size={28} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{reply.author}</span>
                      <span className="text-[#717375] text-xs">{reply.handle}</span>
                      <span className="text-[#717375] text-xs">· {timeAgo(reply.timestamp)}</span>
                    </div>
                    <p className="text-sm text-white mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
              {thread.replies.length > 2 && (
                <button
                  onClick={() => onReplyClick(thread)}
                  className="text-[#717375] text-sm hover:text-white transition-colors"
                >
                  View all {thread.replies.length} replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Reply Modal ─── */
function ReplyModal({
  thread,
  onClose,
  onReply
}: {
  thread: Thread;
  onClose: () => void;
  onReply: (threadId: string, content: string) => void;
}) {
  const [replyText, setReplyText] = useState('');
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 4 - replyImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setReplyImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReply = () => {
    if (!replyText.trim() && replyImages.length === 0) return;
    onReply(thread.id, replyText);
    setReplyText('');
    setReplyImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-[#0a0a0a] border border-[#2f3336] rounded-2xl mx-4 overflow-hidden animate-fade-in-slide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#2f3336]">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold">Reply</span>
        </div>

        {/* Original thread */}
        <div className="px-4 py-4 flex gap-3 opacity-70">
          <Avatar src={thread.avatar} alt={thread.author} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{thread.author}</span>
              <span className="text-[#717375] text-sm">{thread.handle}</span>
            </div>
            <p className="text-white mt-1">{thread.content}</p>
            {thread.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {thread.images.slice(0, 2).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply input */}
        <div className="px-4 py-4 flex gap-3">
          <Avatar src="https://i.pravatar.cc/150?u=me" alt="Me" />
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Post your reply..."
              className="w-full bg-transparent text-white placeholder-[#717375] text-lg resize-none outline-none min-h-[80px]"
              autoFocus
            />
            <ImageGrid
              images={replyImages}
              onRemove={(i) => setReplyImages(prev => prev.filter((_, idx) => idx !== i))}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2f3336]">
              <label className="p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors text-[#717375] hover:text-white">
                <ImagePlus size={20} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${replyText.length > 500 ? 'text-red-400' : 'text-[#717375]'}`}>
                  {replyText.length}/500
                </span>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() && replyImages.length === 0}
                  className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white transition-colors text-sm"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Existing replies */}
        {thread.replies.length > 0 && (
          <div className="border-t border-[#2f3336] px-4 py-4">
            <h3 className="text-sm font-semibold text-[#717375] mb-3">
              {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
            </h3>
            <div className="space-y-4">
              {thread.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar src={reply.avatar} alt={reply.author} size={32} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{reply.author}</span>
                      <span className="text-[#717375] text-xs">{reply.handle}</span>
                      <span className="text-[#717375] text-xs">· {timeAgo(reply.timestamp)}</span>
                    </div>
                    <p className="text-sm text-white mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Thread | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Actions */
  const handleLike = useCallback((id: string) => {
    setThreads(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, isLiked: !t.isLiked, likes: t.isLiked ? t.likes - 1 : t.likes + 1 }
          : t
      )
    );
  }, []);

  const handleRepost = useCallback((id: string) => {
    setThreads(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, isReposted: !t.isReposted, reposts: t.isReposted ? t.reposts - 1 : t.reposts + 1 }
          : t
      )
    );
    const thread = threads.find(t => t.id === id);
    if (thread) {
      toast.success(thread.isReposted ? 'Removed repost' : 'Reposted to your profile');
    }
  }, [threads]);

  const handleShare = useCallback((content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    toast.success('Copied to clipboard');
  }, []);

  const handleDelete = useCallback((id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    toast.success('Thread deleted');
  }, []);

  const handlePost = () => {
    if (!newPostText.trim() && newPostImages.length === 0) return;

    const newThread: Thread = {
      id: generateId(),
      author: 'You',
      handle: '@you',
      avatar: 'https://i.pravatar.cc/150?u=me',
      content: newPostText,
      images: newPostImages,
      likes: 0,
      replies: [],
      reposts: 0,
      isLiked: false,
      isReposted: false,
      timestamp: new Date().toISOString(),
      isCurrentUser: true
    };

    setThreads(prev => [newThread, ...prev]);
    setNewPostText('');
    setNewPostImages([]);
    toast.success('Thread posted!');
  };

  const handleReply = (threadId: string, content: string) => {
    const reply: Reply = {
      id: generateId(),
      author: 'You',
      handle: '@you',
      avatar: 'https://i.pravatar.cc/150?u=me',
      content,
      timestamp: new Date().toISOString()
    };

    setThreads(prev =>
      prev.map(t =>
        t.id === threadId ? { ...t, replies: [reply, ...t.replies] } : t
      )
    );
    toast.success('Reply posted!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 4 - newPostImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setNewPostImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex justify-center">
      <Toaster position="top-center" toastOptions={{ style: { background: '#181818', color: '#fff', border: '1px solid #2f3336' } }} />

      {/* Mobile nav (bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur border-t border-[#2f3336] flex justify-around items-center py-3 z-40 md:hidden">
        <button onClick={() => setActiveTab('home')} className={`p-2 rounded-full transition-colors ${activeTab === 'home' ? 'text-white' : 'text-[#717375]'}`}>
          <Home size={24} />
        </button>
        <button onClick={() => setActiveTab('search')} className={`p-2 rounded-full transition-colors ${activeTab === 'search' ? 'text-white' : 'text-[#717375]'}`}>
          <Search size={24} />
        </button>
        <button className="p-3 bg-white text-black rounded-full">
          <Send size={20} />
        </button>
        <button onClick={() => setActiveTab('activity')} className={`p-2 rounded-full transition-colors ${activeTab === 'activity' ? 'text-white' : 'text-[#717375]'}`}>
          <Bell size={24} />
        </button>
        <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-full transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-[#717375]'}`}>
          <User size={24} />
        </button>
      </nav>

      <div className="w-full max-w-[640px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#2f3336]">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold tracking-tight">Thread</h1>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => setActiveTab('home')} className={`p-3 rounded-full transition-colors ${activeTab === 'home' ? 'text-white bg-white/10' : 'text-[#717375] hover:bg-white/10'}`}>
                <Home size={22} />
              </button>
              <button onClick={() => setActiveTab('search')} className={`p-3 rounded-full transition-colors ${activeTab === 'search' ? 'text-white bg-white/10' : 'text-[#717375] hover:bg-white/10'}`}>
                <Search size={22} />
              </button>
              <button onClick={() => setActiveTab('activity')} className={`p-3 rounded-full transition-colors ${activeTab === 'activity' ? 'text-white bg-white/10' : 'text-[#717375] hover:bg-white/10'}`}>
                <Bell size={22} />
              </button>
              <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-full transition-colors ${activeTab === 'profile' ? 'text-white bg-white/10' : 'text-[#717375] hover:bg-white/10'}`}>
                <User size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Compose */}
        <div className="border-b border-[#2f3336] px-4 py-4">
          <div className="flex gap-3">
            <Avatar src="https://i.pravatar.cc/150?u=me" alt="Me" />
            <div className="flex-1">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's new?"
                className="w-full bg-transparent text-white placeholder-[#717375] text-lg resize-none outline-none min-h-[60px]"
                rows={2}
              />
              <ImageGrid
                images={newPostImages}
                onRemove={(i) => setNewPostImages(prev => prev.filter((_, idx) => idx !== i))}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <label className="p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors text-[#717375] hover:text-white">
                    <ImagePlus size={20} />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#717375] hover:text-white">
                    <AtSign size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#717375] hover:text-white">
                    <Hash size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${newPostText.length > 500 ? 'text-red-400' : 'text-[#717375]'}`}>
                    {newPostText.length}/500
                  </span>
                  <button
                    onClick={handlePost}
                    disabled={!newPostText.trim() && newPostImages.length === 0}
                    className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white transition-colors text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <main className="flex-1 pb-20 md:pb-4">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#717375]">
              <MessageCircle size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No threads yet</p>
              <p className="text-sm mt-1">Be the first to post something!</p>
            </div>
          ) : (
            threads.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onLike={handleLike}
                onReplyClick={setReplyingTo}
                onRepost={handleRepost}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))
          )}
        </main>
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <ReplyModal
          thread={replyingTo}
          onClose={() => setReplyingTo(null)}
          onReply={handleReply}
        />
      )}
    </div>
  );
}
