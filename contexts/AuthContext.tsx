import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';
import { initializeDemoUsers } from '../utils/demoData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'student' | 'teacher' | 'admin' | 'dev') => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await initializeDemoUsers();
    await loadStoredUser();
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Convert date strings back to Date objects
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        parsedUser.lastSeen = new Date(parsedUser.lastSeen);
        setUser(parsedUser);
      }
    } catch (error) {
      console.log('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would be a backend call
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userToLogin: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          avatar: foundUser.avatar,
          createdAt: new Date(foundUser.createdAt),
          lastSeen: new Date()
        };
        
        setUser(userToLogin);
        await AsyncStorage.setItem('user', JSON.stringify(userToLogin));
        console.log('User logged in:', userToLogin.name, 'Role:', userToLogin.role);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'teacher' | 'admin' | 'dev'): Promise<boolean> => {
    try {
      // Check if user already exists
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        return false; // User already exists
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In real app, this would be hashed
        name,
        role,
        createdAt: new Date(),
        lastSeen: new Date()
      };
      
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      const userToLogin: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
        lastSeen: newUser.lastSeen
      };
      
      setUser(userToLogin);
      await AsyncStorage.setItem('user', JSON.stringify(userToLogin));
      console.log('User registered and logged in:', userToLogin.name, 'Role:', userToLogin.role);
      return true;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
      console.log('User logged out');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};