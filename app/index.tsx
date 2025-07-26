import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles } from '../styles/commonStyles';
import AuthScreen from '../components/AuthScreen';
import ChatListScreen from '../components/ChatListScreen';

export default function MainScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#64B5F6" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <ChatListScreen />;
}