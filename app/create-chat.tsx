import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors } from '../styles/commonStyles';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function CreateChatScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<('student' | 'teacher' | 'admin' | 'dev')[]>(['student', 'teacher', 'admin', 'dev']);
  const [isLoading, setIsLoading] = useState(false);

  const { createChat } = useChat();
  const { user } = useAuth();

  const roleOptions = [
    { value: 'student', label: 'Students', emoji: '🎓' },
    { value: 'teacher', label: 'Teachers', emoji: '👨‍🏫' },
    { value: 'admin', label: 'Admins', emoji: '👑' },
    { value: 'dev', label: 'Developers', emoji: '👨‍💻' }
  ];

  const handleCreateChat = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a chat name');
      return;
    }

    if (selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one role');
      return;
    }

    setIsLoading(true);
    try {
      await createChat(name.trim(), description.trim() || undefined, isPrivate, selectedRoles);
      Alert.alert('Success', 'Chat created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create chat. Please try again.');
      console.log('Error creating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (role: 'student' | 'teacher' | 'admin' | 'dev') => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  return (
    <View style={commonStyles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chat Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter chat name"
              placeholderTextColor={colors.grey}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter chat description (optional)"
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Privacy Settings</Text>
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View style={styles.privacyInfo}>
                <Text style={styles.privacyTitle}>
                  {isPrivate ? '🔒 Private Chat' : '🌐 Public Chat'}
                </Text>
                <Text style={styles.privacyDescription}>
                  {isPrivate 
                    ? 'Only selected roles can see and join this chat'
                    : 'All users with allowed roles can see this chat'
                  }
                </Text>
              </View>
              <View style={[styles.checkbox, isPrivate && styles.checkboxChecked]}>
                {isPrivate && <Icon name="checkmark" size={16} style={styles.checkIcon} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Allowed Roles *</Text>
            <Text style={styles.sublabel}>Select which roles can access this chat</Text>
            <View style={styles.rolesContainer}>
              {roleOptions.map((option) => {
                const isSelected = selectedRoles.includes(option.value as any);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.roleOption,
                      isSelected && styles.roleOptionSelected
                    ]}
                    onPress={() => toggleRole(option.value as any)}
                  >
                    <Text style={styles.roleEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.roleText,
                      isSelected && styles.roleTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    <View style={[styles.roleCheckbox, isSelected && styles.roleCheckboxSelected]}>
                      {isSelected && <Icon name="checkmark" size={12} style={styles.roleCheckIcon} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewName}>{name || 'Chat Name'}</Text>
                {isPrivate && (
                  <View style={styles.previewPrivateBadge}>
                    <Icon name="lock-closed" size={12} />
                    <Text style={styles.previewPrivateText}>Private</Text>
                  </View>
                )}
              </View>
              {description && (
                <Text style={styles.previewDescription}>{description}</Text>
              )}
              <View style={styles.previewRoles}>
                {selectedRoles.map((role) => {
                  const roleOption = roleOptions.find(r => r.value === role);
                  return (
                    <Text key={role} style={styles.previewRoleTag}>
                      {roleOption?.emoji}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>

          <Button
            text={isLoading ? 'Creating...' : 'Create Chat'}
            onPress={handleCreateChat}
            style={[styles.createButton, isLoading && styles.disabledButton]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
    backgroundColor: colors.backgroundAlt,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey + '50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey + '50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: colors.grey,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkIcon: {
    color: colors.background,
  },
  rolesContainer: {
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey + '50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  roleOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  roleEmoji: {
    fontSize: 20,
  },
  roleText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  roleTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  roleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  roleCheckIcon: {
    color: colors.background,
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  previewPrivateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  previewPrivateText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '500',
  },
  previewDescription: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  },
  previewRoles: {
    flexDirection: 'row',
    gap: 4,
  },
  previewRoleTag: {
    fontSize: 16,
  },
  createButton: {
    backgroundColor: colors.accent,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
});