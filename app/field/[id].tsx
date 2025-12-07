import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllFields,
  selectFieldLoading,
} from '../../src/store/slices/fieldSlice';
import { RootState, AppDispatch } from '../../src/store';
import { calculateFieldStatus } from '../../src/services/fieldService';

const { width } = Dimensions.get('window');
const colors = {
  primary: '#10b981',
  primaryLight: '#34d399',
  background: '#f0fdf4',
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const allFields = useSelector(selectAllFields);
  const loading = useSelector(selectFieldLoading);
  
  // Find the field directly from the loaded fields
  const field = allFields.find((f) => f.id === id);

  useEffect(() => {
    console.log('Field Detail Screen - ID:', id);
    console.log('All fields:', allFields);
    console.log('Found field:', field);
  }, [id, allFields, field]);

  if (!field) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.loadingContainer}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.loadingText}>Field not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const statusInfo = calculateFieldStatus(field.healthMetrics);
  const plantAge = Math.floor(
    (new Date().getTime() - new Date(field.plantingDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntilHarvest = Math.floor(
    (new Date(field.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getMetricColor = (value: number, invert: boolean = false) => {
    if (invert) {
      if (value > 70) return colors.danger;
      if (value > 40) return colors.warning;
      return colors.success;
    }
    if (value >= 70) return colors.success;
    if (value >= 40) return colors.warning;
    return colors.danger;
  };

  const getStatusColor = () => {
    switch (statusInfo.status) {
      case 'Excellent':
        return colors.success;
      case 'Good':
        return colors.primaryLight;
      case 'Needs Attention':
        return colors.warning;
      case 'Critical':
        return colors.danger;
      default:
        return colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.cropEmoji}>{field.image || '🌾'}</Text>
          <Text style={styles.fieldName}>{field.name}</Text>
          <Text style={styles.cropType}>{field.cropType}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Status Badge */}
          <BlurView intensity={20} tint="light" style={styles.statusCard}>
            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {statusInfo.status}
                </Text>
              </View>
              {statusInfo.alerts.length > 0 && (
                <View style={styles.alertsContainer}>
                  <Text style={styles.alertsTitle}>⚠️ Alerts:</Text>
                  {statusInfo.alerts.map((alert, index) => (
                    <Text key={index} style={styles.alertText}>
                      • {alert}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </BlurView>

          {/* Field Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{field.size} Ha</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Plant Age</Text>
                <Text style={styles.infoValue}>{plantAge} days</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Harvest In</Text>
                <Text style={styles.infoValue}>{daysUntilHarvest} days</Text>
              </View>
            </View>
          </View>

          {/* Health Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
            <View style={styles.metricsGrid}>
              {/* Water Depth */}
              <BlurView intensity={15} tint="light" style={styles.metricCard}>
                <View style={styles.metricContent}>
                  <Text style={styles.metricIcon}>💧</Text>
                  <Text style={styles.metricLabel}>Water Depth</Text>
                  <View style={styles.metricValueContainer}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getMetricColor(field.healthMetrics.waterDepth) },
                      ]}
                    >
                      {field.healthMetrics.waterDepth}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${field.healthMetrics.waterDepth}%`,
                          backgroundColor: getMetricColor(field.healthMetrics.waterDepth),
                        },
                      ]}
                    />
                  </View>
                </View>
              </BlurView>

              {/* Plant Health */}
              <BlurView intensity={15} tint="light" style={styles.metricCard}>
                <View style={styles.metricContent}>
                  <Text style={styles.metricIcon}>🌱</Text>
                  <Text style={styles.metricLabel}>Plant Health</Text>
                  <View style={styles.metricValueContainer}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getMetricColor(field.healthMetrics.plantHealth) },
                      ]}
                    >
                      {field.healthMetrics.plantHealth}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${field.healthMetrics.plantHealth}%`,
                          backgroundColor: getMetricColor(field.healthMetrics.plantHealth),
                        },
                      ]}
                    />
                  </View>
                </View>
              </BlurView>

              {/* Soil Quality */}
              <BlurView intensity={15} tint="light" style={styles.metricCard}>
                <View style={styles.metricContent}>
                  <Text style={styles.metricIcon}>🌍</Text>
                  <Text style={styles.metricLabel}>Soil Quality</Text>
                  <View style={styles.metricValueContainer}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getMetricColor(field.healthMetrics.soilQuality) },
                      ]}
                    >
                      {field.healthMetrics.soilQuality}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${field.healthMetrics.soilQuality}%`,
                          backgroundColor: getMetricColor(field.healthMetrics.soilQuality),
                        },
                      ]}
                    />
                  </View>
                </View>
              </BlurView>

              {/* Pest Level */}
              <BlurView intensity={15} tint="light" style={styles.metricCard}>
                <View style={styles.metricContent}>
                  <Text style={styles.metricIcon}>🐛</Text>
                  <Text style={styles.metricLabel}>Pest Level</Text>
                  <View style={styles.metricValueContainer}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getMetricColor(field.healthMetrics.pestLevel, true) },
                      ]}
                    >
                      {field.healthMetrics.pestLevel}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${field.healthMetrics.pestLevel}%`,
                          backgroundColor: getMetricColor(field.healthMetrics.pestLevel, true),
                        },
                      ]}
                    />
                  </View>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Location & Notes */}
          {field.location?.address && (
            <BlurView intensity={15} tint="light" style={styles.detailCard}>
              <Text style={styles.detailTitle}>📍 Location</Text>
              <Text style={styles.detailText}>{field.location.address}</Text>
            </BlurView>
          )}

          {field.notes && (
            <BlurView intensity={15} tint="light" style={styles.detailCard}>
              <Text style={styles.detailTitle}>📝 Notes</Text>
              <Text style={styles.detailText}>{field.notes}</Text>
            </BlurView>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Coming Soon', 'Update field metrics feature')}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>Update Metrics</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/crop-disease')}
            >
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>Check Disease</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  cropEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  fieldName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  cropType: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statusContent: {
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  alertsContainer: {
    marginTop: 10,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  infoSection: {
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  metricContent: {
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  metricValueContainer: {
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  detailCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 10,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
