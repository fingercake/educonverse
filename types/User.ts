export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'dev';
  avatar?: string;
  createdAt: Date;
  lastSeen: Date;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'teacher' | 'admin' | 'dev';
  timestamp: Date;
  chatId: string;
}

export interface Chat {
  id: string;
  name: string;
  description?: string;
  participants: string[];
  messages: Message[];
  createdAt: Date;
  lastMessage?: Message;
  isPrivate: boolean;
  allowedRoles?: ('student' | 'teacher' | 'admin' | 'dev')[];
}