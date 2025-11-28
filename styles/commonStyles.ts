
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Primary brand colors with soft pastel tones
  primary: '#6BCF7F',
  primaryLight: '#A8E6B5',
  primaryDark: '#4CAF50',
  secondary: '#FFB74D',
  accent: '#64B5F6',
  
  // Glassmorphism backgrounds
  background: '#F8FAF9',
  backgroundAlt: '#FFFFFF',
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassDark: 'rgba(255, 255, 255, 0.85)',
  
  // Card styles with glass effect
  card: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.75)',
  cardBorder: 'rgba(255, 255, 255, 0.3)',
  
  // Text colors
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#95A5A6',
  textWhite: '#FFFFFF',
  
  // UI elements
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  grey: '#E0E0E0',
  
  // Status colors
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFB84D',
  info: '#4DABF7',
  
  // Field status colors
  statusGood: '#51CF66',
  statusNeedWater: '#FFB84D',
  statusWarning: '#FF8787',
  brown: '#8D6E63',
  beige: '#F5F5DC',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  textSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  textBold: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});
