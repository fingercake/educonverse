import AsyncStorage from '@react-native-async-storage/async-storage';

export const initializeDemoUsers = async () => {
  try {
    const existingUsers = await AsyncStorage.getItem('users');
    if (existingUsers) {
      return; // Demo users already exist
    }

    const demoUsers = [
      {
        id: 'demo-student',
        email: 'student@demo.com',
        password: 'password',
        name: 'Alex Student',
        role: 'student',
        createdAt: new Date(),
        lastSeen: new Date()
      },
      {
        id: 'demo-teacher',
        email: 'teacher@demo.com',
        password: 'password',
        name: 'Sarah Teacher',
        role: 'teacher',
        createdAt: new Date(),
        lastSeen: new Date()
      },
      {
        id: 'demo-admin',
        email: 'admin@demo.com',
        password: 'password',
        name: 'Mike Admin',
        role: 'admin',
        createdAt: new Date(),
        lastSeen: new Date()
      },
      {
        id: 'demo-dev',
        email: 'dev@demo.com',
        password: 'password',
        name: 'Jordan Developer',
        role: 'dev',
        createdAt: new Date(),
        lastSeen: new Date()
      }
    ];

    await AsyncStorage.setItem('users', JSON.stringify(demoUsers));
    console.log('Demo users initialized');
  } catch (error) {
    console.log('Error initializing demo users:', error);
  }
};