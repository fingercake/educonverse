import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message, User } from '../types/User';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
  sendMessage: (text: string, chatId: string) => Promise<void>;
  createChat: (name: string, description?: string, isPrivate?: boolean, allowedRoles?: ('student' | 'teacher' | 'admin' | 'dev')[]) => Promise<Chat>;
  joinChat: (chatId: string) => Promise<boolean>;
  leaveChat: (chatId: string) => Promise<boolean>;
  loadChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChats();
      initializeDefaultChats();
    }
  }, [user]);

  const initializeDefaultChats = async () => {
    try {
      const storedChats = await AsyncStorage.getItem('chats');
      const existingChats = storedChats ? JSON.parse(storedChats) : [];
      
      // Create default chats if they don't exist
      const defaultChats = [
        {
          id: 'general',
          name: 'General Discussion',
          description: 'General chat for all students',
          participants: [],
          messages: [],
          createdAt: new Date(),
          isPrivate: false,
          allowedRoles: ['student', 'teacher', 'admin', 'dev']
        },
        {
          id: 'study-group',
          name: 'Study Group',
          description: 'Collaborative study discussions',
          participants: [],
          messages: [],
          createdAt: new Date(),
          isPrivate: false,
          allowedRoles: ['student', 'teacher', 'admin', 'dev']
        },
        {
          id: 'dev-chat',
          name: 'Dev Chat',
          description: 'Special chat for developers only',
          participants: [],
          messages: [],
          createdAt: new Date(),
          isPrivate: true,
          allowedRoles: ['dev', 'admin']
        }
      ];

      let needsUpdate = false;
      defaultChats.forEach(defaultChat => {
        const exists = existingChats.find((chat: Chat) => chat.id === defaultChat.id);
        if (!exists) {
          existingChats.push(defaultChat);
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        await AsyncStorage.setItem('chats', JSON.stringify(existingChats));
      }
    } catch (error) {
      console.log('Error initializing default chats:', error);
    }
  };

  const loadChats = async () => {
    try {
      const storedChats = await AsyncStorage.getItem('chats');
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        // Convert date strings back to Date objects
        const chatsWithDates = parsedChats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp)
          } : undefined
        }));
        
        // Filter chats based on user role
        const accessibleChats = chatsWithDates.filter((chat: Chat) => {
          if (!chat.allowedRoles || chat.allowedRoles.length === 0) return true;
          return user && chat.allowedRoles.includes(user.role);
        });
        
        setChats(accessibleChats);
        console.log('Loaded chats for user role:', user?.role, 'Accessible chats:', accessibleChats.length);
      }
    } catch (error) {
      console.log('Error loading chats:', error);
    }
  };

  const sendMessage = async (text: string, chatId: string) => {
    if (!user) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        timestamp: new Date(),
        chatId
      };

      const storedChats = await AsyncStorage.getItem('chats');
      const allChats = storedChats ? JSON.parse(storedChats) : [];
      
      const updatedChats = allChats.map((chat: Chat) => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage
          };
          return updatedChat;
        }
        return chat;
      });

      await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
      await loadChats(); // Reload to update state
      console.log('Message sent:', text, 'to chat:', chatId);
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  const createChat = async (name: string, description?: string, isPrivate: boolean = false, allowedRoles?: ('student' | 'teacher' | 'admin' | 'dev')[]): Promise<Chat> => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name,
      description,
      participants: user ? [user.id] : [],
      messages: [],
      createdAt: new Date(),
      isPrivate,
      allowedRoles
    };

    try {
      const storedChats = await AsyncStorage.getItem('chats');
      const allChats = storedChats ? JSON.parse(storedChats) : [];
      allChats.push(newChat);
      await AsyncStorage.setItem('chats', JSON.stringify(allChats));
      await loadChats();
      console.log('Chat created:', name);
      return newChat;
    } catch (error) {
      console.log('Error creating chat:', error);
      throw error;
    }
  };

  const joinChat = async (chatId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const storedChats = await AsyncStorage.getItem('chats');
      const allChats = storedChats ? JSON.parse(storedChats) : [];
      
      const updatedChats = allChats.map((chat: Chat) => {
        if (chat.id === chatId && !chat.participants.includes(user.id)) {
          return {
            ...chat,
            participants: [...chat.participants, user.id]
          };
        }
        return chat;
      });

      await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
      await loadChats();
      console.log('Joined chat:', chatId);
      return true;
    } catch (error) {
      console.log('Error joining chat:', error);
      return false;
    }
  };

  const leaveChat = async (chatId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const storedChats = await AsyncStorage.getItem('chats');
      const allChats = storedChats ? JSON.parse(storedChats) : [];
      
      const updatedChats = allChats.map((chat: Chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            participants: chat.participants.filter(id => id !== user.id)
          };
        }
        return chat;
      });

      await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
      await loadChats();
      console.log('Left chat:', chatId);
      return true;
    } catch (error) {
      console.log('Error leaving chat:', error);
      return false;
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      currentChat,
      setCurrentChat,
      sendMessage,
      createChat,
      joinChat,
      leaveChat,
      loadChats
    }}>
      {children}
    </ChatContext.Provider>
  );
};