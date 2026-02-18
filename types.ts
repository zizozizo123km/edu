
export type StreamType = 'علوم تجريبية' | 'رياضيات' | 'تقني رياضي' | 'آداب وفلسفة' | 'لغات أجنبية' | 'تسيير واقتصاد' | 'فنون';

export interface Subject {
  id: number;
  name: string;
  icon: string;
  progress: number;
  color: string;
  description: string;
}

export interface Summary {
  id: number | string;
  title: string;
  subject: string;
  author: string;
  downloads: number;
  rating: number;
  commentsCount: number;
  icon: string;
  color: string;
  fileSize: string;
  streams: StreamType[];
  uploadDate: string;
  previewSnippet?: string;
  url?: string;
}

export interface Post {
  id: number;
  author: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  tag: string;
  avatarSeed: string;
}

export interface StreamMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  avatarSeed: string;
}

export interface UserState {
  name: string;
  stream: StreamType | '';
  xp: number;
  streak: number;
  avatarSeed: string;
  joinDate: string;
  rank: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  duration: number; // minutes
}
