
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';

const Index: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Simple redirect without delay (splash animation handled in _layout)
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  return <View style={{ flex: 1 }} />;
};

export default Index;
