
import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { WeatherData } from '../services/weatherService';
import { IconSymbol } from '../../components/IconSymbol';

interface WeatherDetailModalProps {
  visible: boolean;
  weather: WeatherData | null;
  onClose: () => void;
}

const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({ visible, weather, onClose }) => {
  if (!weather) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Weather Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.currentWeather}>
            <Text style={styles.location}>{weather.location}</Text>
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
            <Text style={styles.feelsLike}>Feels like {weather.feelsLike}°C</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <IconSymbol name="drop" size={24} color={colors.primary} />
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weather.humidity}%</Text>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol name="wind" size={24} color={colors.primary} />
              <Text style={styles.detailLabel}>Wind Speed</Text>
              <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol name="sun.max" size={24} color={colors.primary} />
              <Text style={styles.detailLabel}>UV Index</Text>
              <Text style={styles.detailValue}>{weather.uvIndex}</Text>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol name="eye" size={24} color={colors.primary} />
              <Text style={styles.detailLabel}>Visibility</Text>
              <Text style={styles.detailValue}>{weather.visibility} km</Text>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol name="gauge" size={24} color={colors.primary} />
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>{weather.pressure} hPa</Text>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol name="sunrise" size={24} color={colors.primary} />
              <Text style={styles.detailLabel}>Sunrise</Text>
              <Text style={styles.detailValue}>{weather.sunrise}</Text>
            </View>
          </View>

          <View style={styles.sunsetCard}>
            <IconSymbol name="sunset" size={24} color={colors.primary} />
            <Text style={styles.detailLabel}>Sunset</Text>
            <Text style={styles.detailValue}>{weather.sunset}</Text>
          </View>

          <View style={styles.forecastSection}>
            <Text style={styles.sectionTitle}>5-Day Forecast</Text>
            {weather.forecast.map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <View style={styles.forecastLeft}>
                  <Text style={styles.forecastDay}>{day.day}</Text>
                  <Text style={styles.forecastCondition}>{day.condition}</Text>
                </View>
                <View style={styles.forecastCenter}>
                  <Text style={styles.forecastIcon}>{day.icon}</Text>
                  <Text style={styles.forecastPrecip}>{day.precipitation}%</Text>
                </View>
                <View style={styles.forecastRight}>
                  <Text style={styles.forecastHigh}>{day.high}°</Text>
                  <Text style={styles.forecastLow}>{day.low}°</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentWeather: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginVertical: 20,
  },
  location: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.backgroundAlt,
    marginBottom: 8,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '300',
    color: colors.backgroundAlt,
    lineHeight: 70,
  },
  condition: {
    fontSize: 20,
    color: colors.backgroundAlt,
    opacity: 0.9,
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 16,
    color: colors.backgroundAlt,
    opacity: 0.8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    ...commonStyles.card,
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  sunsetCard: {
    ...commonStyles.card,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  forecastSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  forecastItem: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  forecastLeft: {
    flex: 2,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  forecastCondition: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  forecastCenter: {
    flex: 1,
    alignItems: 'center',
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  forecastPrecip: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  forecastRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  forecastHigh: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  forecastLow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default WeatherDetailModal;
