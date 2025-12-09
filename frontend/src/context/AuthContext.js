import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventBus from '../utils/eventBus';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    // Escuchar evento de logout forzado (401)
    const unsubscribe = EventBus.on('auth:logout', () => {
      console.log('🚪 AuthContext: Forced logout triggered');
      setUser(null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      console.log('🔄 AuthContext: Loading user...');
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔑 AuthContext: Token exists:', !!token);

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await AuthService.getCurrentUser();
      console.log('👤 AuthContext: User loaded:', userData ? userData.username : 'No user');
      setUser(userData);
    } catch (error) {
      console.error('❌ AuthContext: Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    console.log('AuthContext.login called');
    const result = await AuthService.login(username, password);
    console.log('AuthService.login result:', result);
    if (result.success) {
      console.log('Setting user in context:', result.user);
      setUser(result.user);
      console.log('User state updated');
    } else {
      console.log('Login failed in AuthContext:', result.error);
    }
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};




