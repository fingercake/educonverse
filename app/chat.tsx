import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { currentChat, sendMessage } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (!currentChat) {
      router.back();
    }
  }, [currentChat]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentChat?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChat || isLoading) return;

    setIsLoading(true);
    try {
      await sendMessage(message.trim(), currentChat.id);
      setMessage('');
    } catch (error) {
      console.log('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentChat) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center' }]}>
        <Text style={commonStyles.text}>Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={commonStyles.wrapper} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{currentChat.name}</Text>
          <Text style={styles.participantCount}>
            {currentChat.participants.length} participants
          </Text>
        </View>

        {currentChat.isPrivate && (
          <View style={styles.privateBadge}>
            <Icon name="lock-closed" size={16} />
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {currentChat.messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="chatbubbles-outline" size={64} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Be the first to start the conversation!</Text>
          </View>
        ) : (
          currentChat.messages.map((msg) => {
            const isOwnMessage = msg.userId === user?.id;
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  isOwnMessage ? styles.ownMessage : styles.otherMessage
                ]}
              >
                {!isOwnMessage && (
                  <View style={styles.messageHeader}>
                    <Text style={[styles.senderName, { color: getRoleColor(msg.userRole) }]}>
                      {getRoleBadge(msg.userRole)} {msg.userName}
                    </Text>
                    <Text style={styles.messageTime}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                  ]}>
                    {msg.text}
                  </Text>
                </View>
                
                {isOwnMessage && (
                  <Text style={[styles.messageTime, styles.ownMessageTime]}>
                    {formatTime(msg.timestamp)}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.grey}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!message.trim() || isLoading}
        >
          <Icon 
            name={isLoading ? "hourglass-outline" : "send"} 
            size={20} 
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
    backgroundColor: colors.backgroundAlt,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  participantCount: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 2,
  },
  privateBadge: {
    padding: 8,
    backgroundColor: colors.accent + '30',
    borderRadius: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
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
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
    color: colors.grey,
  },
  ownMessageTime: {
    textAlign: 'right',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.backgroundAlt,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.background,
  },
  otherMessageText: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey + '30',
    backgroundColor: colors.backgroundAlt,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderColor: colors.grey + '50',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.grey + '50',
  },
  sendIcon: {
    color: colors.background,
  },
});