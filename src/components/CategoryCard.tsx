
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';

interface CategoryCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  icon, 
  onPress, 
  color = colors.primary 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.card,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    aspectRatio: 1,
    marginHorizontal: '1.5%',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundAlt,
    textAlign: 'center',
  },
});

export default CategoryCard;
