
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions, ImageBackground, Image } from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootState, AppDispatch } from '../../src/store';
import { setProducts, setLoading } from '../../src/store/slices/productSlice';
import { getProducts } from '../../src/services/productService';
import { colors, commonStyles } from '../../styles/commonStyles';
import WeatherWidget from '../../src/components/WeatherWidget';
import CategoryCard from '../../src/components/CategoryCard';
import { fetchUserFields, selectFieldsWithStatus } from '../../src/store/slices/fieldSlice';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const fieldsWithStatus = useSelector(selectFieldsWithStatus);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const loadProducts = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const products = await getProducts();
      dispatch(setProducts(products));
    } catch (error) {
      console.log('Error loading products:', error);
    }
  }, [dispatch]);

  const loadFields = useCallback(async () => {
    if (user?.uid) {
      try {
        await dispatch(fetchUserFields(user.uid));
      } catch (error) {
        console.log('Error loading fields:', error);
      }
    }
  }, [dispatch, user?.uid]);

  useEffect(() => {
    loadProducts();
    loadFields();
  }, [loadProducts, loadFields]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    await loadFields();
    setRefreshing(false);
  };

  const navigateToCategory = (category: string) => {
    router.push(`/(tabs)/catalog?category=${category}`);
  };

  const navigateToAction = (action: string) => {
    console.log('Navigate to action:', action);
    switch (action) {
      case 'crop-detection':
        router.push('/crop-disease');
        break;
      case 'forum':
        router.push('/(tabs)/forum');
        break;
      case 'govt-schemes':
        console.log('Navigate to government schemes');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Transform fields data for display
  const myFields = fieldsWithStatus.map((field) => {
    console.log('Field in home:', field.id, field.name);
    return {
      id: field.id,
      name: field.name,
      cropType: field.cropType,
      size: `${field.size} Ha`,
      status: field.statusInfo.status,
      image: field.image || '🌾',
      needsAttention: field.statusInfo.needsAttention,
      alerts: field.statusInfo.alerts,
    };
  });

  const tasks = [
    { id: 1, title: 'Watering', location: 'Tomatoes Field', time: '10:10 AM', completed: true },
    { id: 2, title: 'Fertilizing', location: 'Lettuce Field', time: '11:30 AM', completed: false },
    { id: 3, title: 'Pest Control', location: 'Rice Field', time: '02:00 PM', completed: false },
  ];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      bounces={true}
      alwaysBounceVertical={true}
      decelerationRate="normal"
      scrollEventThrottle={16}
    >
      {/* Glass Header */}
      <LinearGradient
        colors={['#F8FAF9', '#E8F5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || '👤'}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.userName}>{user?.name || 'Rizkan Firmansyah'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <View style={styles.notificationDot} />
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Weather Widget */}
        <WeatherWidget />

        {/* My Fields Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Fields</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.fieldsScroll}
          >
            {myFields.map((field) => (
              <TouchableOpacity 
                key={field.id}
                style={styles.fieldCard}
                activeOpacity={0.8}
                onPress={() => {
                  console.log('Navigating to field:', field.id);
                  router.push({ pathname: '/field/[id]', params: { id: field.id } });
                }}
              >
                <BlurView intensity={20} tint="light" style={styles.fieldBlur}>
                  <View style={styles.fieldContent}>
                    {field.needsAttention && (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{field.status}</Text>
                      </View>
                    )}
                    {!field.needsAttention && (
                      <View style={[styles.statusBadge, styles.statusGoodBadge]}>
                        <Text style={[styles.statusBadgeText, styles.statusGoodText]}>{field.status}</Text>
                      </View>
                    )}
                    <View style={styles.fieldImageContainer}>
                      <Text style={styles.fieldEmoji}>{field.image}</Text>
                    </View>
                    <Text style={styles.fieldName}>{field.name}</Text>
                    <Text style={styles.fieldSubtitle}>{field.cropType}</Text>
                    <Text style={styles.fieldSize}>{field.size}</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tasks To Do Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks To Do</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <BlurView intensity={15} tint="light" style={styles.taskBlur}>
                <View style={styles.taskContent}>
                  <View style={[
                    styles.taskCheckbox,
                    task.completed && styles.taskCheckboxCompleted
                  ]}>
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted
                    ]}>{task.title}</Text>
                    <Text style={styles.taskLocation}>📍 {task.location}</Text>
                  </View>
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>
              </BlurView>
            </View>
          ))}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.glassActionCard}
              onPress={() => navigateToAction('crop-detection')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🔬</Text>
                </View>
                <Text style={styles.actionTitle}>Plant Doctor</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.glassActionCard}
              onPress={() => navigateToCategory('seeds')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🛒</Text>
                </View>
                <Text style={styles.actionTitle}>Shop</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.glassActionCard}
              onPress={() => navigateToAction('forum')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>💬</Text>
                </View>
                <Text style={styles.actionTitle}>Community</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.glassActionCard}
              onPress={() => navigateToAction('govt-schemes')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🏛️</Text>
                </View>
                <Text style={styles.actionTitle}>Schemes</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Bottom spacing for tab bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: colors.backgroundAlt,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  fieldsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  fieldCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fieldBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  fieldContent: {
    width: 140,
    padding: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusGoodBadge: {
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textWhite,
  },
  statusGoodText: {
    color: colors.textWhite,
  },
  fieldImageContainer: {
    width: 116,
    height: 90,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fieldEmoji: {
    fontSize: 48,
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  fieldSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  fieldSize: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskCheckboxCompleted: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  taskTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  glassActionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(107, 207, 127, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;
