import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { commonStyles, colors } from '../styles/commonStyles';
import Button from './Button';
import Icon from './Icon';

export default function ChatListScreen() {
  const { user, logout } = useAuth();
  const { chats, setCurrentChat } = useChat();

  const handleChatPress = (chat: any) => {
    setCurrentChat(chat);
    router.push('/chat');
  };

  const handleLogout = async () => {
    await logout();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'dev': return '#FF6B6B';
      case 'admin': return '#4ECDC4';
      case 'teacher': return '#45B7D1';
      case 'student': return '#96CEB4';
      default: return colors.grey;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'dev': return '👨‍💻';
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  return (
    <View style={commonStyles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <View style={styles.userRow}>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || '') }]}>
              <Text style={styles.roleEmoji}>{getRoleBadge(user?.role || '')}</Text>
              <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out-outline" size={24} />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Chats</Text>
        
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => handleChatPress(chat)}
          >
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                {chat.isPrivate && (
                  <View style={styles.privateBadge}>
                    <Icon name="lock-closed" size={12} />
                    <Text style={styles.privateText}>Private</Text>
                  </View>
                )}
              </View>
              
              {chat.description && (
                <Text style={styles.chatDescription}>{chat.description}</Text>
              )}
              
              {chat.lastMessage && (
                <View style={styles.lastMessage}>
                  <Text style={styles.lastMessageUser}>
                    {getRoleBadge(chat.lastMessage.userRole)} {chat.lastMessage.userName}:
                  </Text>
                  <Text style={styles.lastMessageText} numberOfLines={1}>
                    {chat.lastMessage.text}
                  </Text>
                </View>
              )}
              
              <View style={styles.chatMeta}>
                <Text style={styles.participantCount}>
                  {chat.participants.length} participants
                </Text>
                {chat.allowedRoles && chat.allowedRoles.length > 0 && (
                  <View style={styles.allowedRoles}>
                    {chat.allowedRoles.map((role, index) => (
                      <Text key={role} style={[styles.roleTag, { backgroundColor: getRoleColor(role) }]}>
                        {getRoleBadge(role)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
            
            <Icon name="chevron-forward" size={20} style={styles.chevron} />
          </TouchableOpacity>
        ))}

        {chats.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="chatbubbles-outline" size={64} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No chats available</Text>
            <Text style={styles.emptyText}>
              Chats will appear here based on your role permissions
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Chat Button */}
      {(user?.role === 'admin' || user?.role === 'dev' || user?.role === 'teacher') && (
        <View style={styles.createButtonContainer}>
          <Button
            text="Create New Chat"
            onPress={() => router.push('/create-chat')}
            style={styles.createButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleEmoji: {
    fontSize: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
  },
  chatList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  privateText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '500',
  },
  chatDescription: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  },
  lastMessage: {
    marginBottom: 8,
  },
  lastMessageUser: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  lastMessageText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  chatMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 12,
    color: colors.grey,
  },
  allowedRoles: {
    flexDirection: 'row',
    gap: 4,
  },
  roleTag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: colors.grey,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    color: colors.grey,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    maxWidth: 250,
  },
  createButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.grey + '30',
  },
  createButton: {
    backgroundColor: colors.accent,
  },
});