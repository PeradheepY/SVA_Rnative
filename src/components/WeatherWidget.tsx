
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, commonStyles } from '../../styles/commonStyles';
import { WeatherData, getWeatherData } from '../services/weatherService';

interface WeatherWidgetProps {
  onPress?: (weather: WeatherData) => void;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onPress }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-20));

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (weather) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [weather, fadeAnim, slideAnim]);

  const fetchWeather = async () => {
    try {
      const data = await getWeatherData();
      setWeather(data);
    } catch (error) {
      console.log('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFarmingTip = (condition: string, temperature: number) => {
    if (condition.toLowerCase().includes('rain')) {
      return '🌧️ Perfect for watering crops naturally. Check drainage systems.';
    } else if (temperature > 35) {
      return '🌡️ High temperature alert! Ensure adequate irrigation for crops.';
    } else if (temperature < 15) {
      return '❄️ Cool weather. Protect sensitive crops from cold stress.';
    } else if (condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sunny')) {
      return '☀️ Ideal conditions for crop growth. Monitor soil moisture.';
    } else if (condition.toLowerCase().includes('cloud')) {
      return '☁️ Moderate conditions. Good time for field activities.';
    }
    return '🌱 Monitor your crops regularly for optimal yield.';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFF9E6', '#E8F5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Fetching weather data...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!weather) {
    return (
      <TouchableOpacity style={styles.container} onPress={() => fetchWeather()}>
        <LinearGradient
          colors={['#FFF9E6', '#E8F5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={styles.errorText}>Unable to load weather data</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const farmingTip = getFarmingTip(weather.condition, weather.temperature);

  const handlePress = () => {
    if (onPress) {
      onPress(weather);
    }
  };

  return (
    <Animated.View 
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#FFF9E6', '#E8F5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <BlurView intensity={15} tint="light" style={styles.blurContainer}>
            {/* Sun Icon */}
            <View style={styles.sunContainer}>
              <Text style={styles.sunIcon}>☀️</Text>
            </View>
            
            {/* Main Temperature */}
            <View style={styles.mainContent}>
              <Text style={styles.temperature}>{weather.temperature}°</Text>
              <Text style={styles.todayText}>Today is partly sunny day!</Text>
            </View>

            {/* Weather Details */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{weather.humidity}%</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{'<'} 0.01 In</Text>
                <Text style={styles.detailLabel}>Precipitation</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{weather.windSpeed} mph/s</Text>
                <Text style={styles.detailLabel}>Wind Speed</Text>
              </View>
            </View>

            {/* Farming Tip */}
            {farmingTip && (
              <View style={styles.farmingTipContainer}>
                <Text style={styles.farmingTipText}>{farmingTip}</Text>
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradientContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.backgroundAlt,
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundAlt,
    opacity: 0.9,
  },
  weatherIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    fontSize: 36,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureContainer: {
    alignItems: 'flex-start',
  },
  temperature: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 60,
  },
  condition: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.backgroundAlt,
    opacity: 0.95,
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.backgroundAlt,
    opacity: 0.85,
  },
  details: {
    alignItems: 'flex-end',
  },
  detailItem: {
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  farmingTipContainer: {
    backgroundColor: 'rgba(107, 207, 127, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  farmingTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.backgroundAlt,
    marginBottom: 6,
  },
  farmingTipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 16,
  },
  forecast: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.backgroundAlt,
    marginBottom: 12,
    opacity: 0.95,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 10,
    flex: 1,
    marginHorizontal: 2,
  },
  forecastDay: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.backgroundAlt,
    opacity: 0.85,
    marginBottom: 6,
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  forecastTemp: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.backgroundAlt,
  },
  loadingText: {
    marginTop: 12,
    color: colors.backgroundAlt,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: colors.backgroundAlt,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  retryText: {
    color: colors.backgroundAlt,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
  },
  sunContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  sunIcon: {
    fontSize: 72,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    marginBottom: 12,
  },
});

export default WeatherWidget;
