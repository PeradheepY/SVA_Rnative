
import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';

const ScannerButton = ({ children, onPress }: { children: React.ReactNode, onPress?: () => void }) => (
  <TouchableOpacity
    style={{
      top: -14,
      justifyContent: 'center',
      alignItems: 'center',
      ...styles.shadow
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={{
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#f8f9fa', 
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'transparent',
          borderRadius: 25,
          height: 70,
          borderTopWidth: 0,
          ...styles.shadow
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={95} 
            tint="light" 
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 25,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
            }} 
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? colors.primary : "#95A5A6"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
              <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={focused ? colors.primary : "#95A5A6"} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="scan-outline" size={30} color="#fff" />
          ),
          tabBarButton: (props) => (
            <ScannerButton {...props} onPress={() => router.push('/crop-disease')} />
          )
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/crop-disease');
          }
        })}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
              <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={focused ? colors.primary : "#95A5A6"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? colors.primary : "#95A5A6"} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  }
});
