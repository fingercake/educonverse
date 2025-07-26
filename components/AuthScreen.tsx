import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors } from '../styles/commonStyles';
import Button from './Button';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin' | 'dev'>('student');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password);
        if (!success) {
          Alert.alert('Error', 'Invalid email or password');
        }
      } else {
        success = await register(email, password, name, role);
        if (!success) {
          Alert.alert('Error', 'User with this email already exists');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.log('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin' },
    { value: 'dev', label: 'Developer' }
  ];

  return (
    <ScrollView style={commonStyles.wrapper} contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={commonStyles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={[commonStyles.text, { marginBottom: 30 }]}>
          {isLogin ? 'Sign in to continue chatting' : 'Join the student community'}
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.grey}
            secureTextEntry
          />
        </View>

        {!isLogin && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.grey}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                {roleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.roleOption,
                      role === option.value && styles.roleOptionSelected
                    ]}
                    onPress={() => setRole(option.value as any)}
                  >
                    <Text style={[
                      styles.roleText,
                      role === option.value && styles.roleTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <Button
          text={isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          onPress={handleSubmit}
          style={[styles.submitButton, isLoading && styles.disabledButton]}
        />

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>

        {/* Demo accounts info */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Demo Accounts:</Text>
          <Text style={styles.demoText}>Student: student@demo.com / password</Text>
          <Text style={styles.demoText}>Teacher: teacher@demo.com / password</Text>
          <Text style={styles.demoText}>Admin: admin@demo.com / password</Text>
          <Text style={styles.demoText}>Dev: dev@demo.com / password</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleOption: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roleOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  roleText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  roleTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  switchButton: {
    alignItems: 'center',
    padding: 10,
  },
  switchText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '500',
  },
  demoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderColor: colors.grey,
    borderWidth: 1,
  },
  demoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    color: colors.grey,
    fontSize: 14,
    marginBottom: 4,
  },
});