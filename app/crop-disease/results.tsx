
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../src/store';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import CustomButton from '../../src/components/CustomButton';
import { DiseaseDetectionResult, Treatment } from '../../src/services/cropDiseaseService';
import { getAvailableExperts, scheduleConsultation } from '../../src/services/cropDiseaseService';
import { setLoadingExperts, setAvailableExperts, setError } from '../../src/store/slices/cropDiseaseSlice';

const ResultsScreen: React.FC = () => {
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { currentDetection, availableExperts, isLoadingExperts } = useSelector((state: RootState) => state.cropDisease);

  const detection = currentDetection;

  const loadExperts = useCallback(async () => {
    try {
      dispatch(setLoadingExperts(true));
      const experts = await getAvailableExperts();
      dispatch(setAvailableExperts(experts));
    } catch (error) {
      console.error('Error loading experts:', error);
      dispatch(setError('Failed to load experts'));
    }
  }, [dispatch]);

  useEffect(() => {
    if (detection) {
      loadExperts();
    }
  }, [detection, loadExperts]);

  const handleConsultExpert = async (expertId: string) => {
    if (!detection) return;

    try {
      Alert.alert(
        'Schedule Consultation',
        'Would you like to schedule a consultation with this expert?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Schedule',
            onPress: async () => {
              try {
                const result = await scheduleConsultation(expertId, detection.id);
                Alert.alert(
                  'Consultation Scheduled',
                  `Your consultation has been scheduled. Consultation ID: ${result.consultationId}`,
                  [{ text: 'OK', onPress: () => router.push('/(tabs)/forum') }]
                );
              } catch (error) {
                console.error('Error scheduling consultation:', error);
                Alert.alert('Error', 'Failed to schedule consultation. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in consultation flow:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getTreatmentTypeColor = (type: string) => {
    switch (type) {
      case 'organic': return colors.success;
      case 'chemical': return colors.warning;
      case 'biological': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  if (!detection) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No detection results found</Text>
        <CustomButton title="Go Back" onPress={handleBack} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detection Results</Text>
      </View>

      <View style={styles.content}>
        {/* Disease Information */}
        <View style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <Text style={styles.diseaseName}>{detection.diseaseName}</Text>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(detection.severity) }]}>
              <Text style={styles.severityText}>{detection.severity.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Level</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${detection.confidence * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>{Math.round(detection.confidence * 100)}%</Text>
          </View>

          <Text style={styles.description}>{detection.description}</Text>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms</Text>
          <View style={styles.listContainer}>
            {detection.symptoms.map((symptom, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{symptom}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Causes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Possible Causes</Text>
          <View style={styles.listContainer}>
            {detection.causes.map((cause, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{cause}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Treatments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Treatments</Text>
          {detection.treatments.map((treatment) => (
            <TouchableOpacity
              key={treatment.id}
              style={[
                styles.treatmentCard,
                selectedTreatment?.id === treatment.id && styles.selectedTreatment
              ]}
              onPress={() => setSelectedTreatment(treatment)}
            >
              <View style={styles.treatmentHeader}>
                <Text style={styles.treatmentName}>{treatment.name}</Text>
                <View style={[styles.treatmentTypeBadge, { backgroundColor: getTreatmentTypeColor(treatment.type) }]}>
                  <Text style={styles.treatmentTypeText}>{treatment.type.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.treatmentDescription}>{treatment.description}</Text>
              
              <View style={styles.treatmentDetails}>
                <View style={styles.treatmentDetailRow}>
                  <Text style={styles.treatmentDetailLabel}>Application:</Text>
                  <Text style={styles.treatmentDetailValue}>{treatment.applicationMethod}</Text>
                </View>
                <View style={styles.treatmentDetailRow}>
                  <Text style={styles.treatmentDetailLabel}>Dosage:</Text>
                  <Text style={styles.treatmentDetailValue}>{treatment.dosage}</Text>
                </View>
                <View style={styles.treatmentDetailRow}>
                  <Text style={styles.treatmentDetailLabel}>Frequency:</Text>
                  <Text style={styles.treatmentDetailValue}>{treatment.frequency}</Text>
                </View>
                <View style={styles.treatmentDetailRow}>
                  <Text style={styles.treatmentDetailLabel}>Cost:</Text>
                  <Text style={styles.treatmentDetailValue}>₹{treatment.cost}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prevention Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prevention Tips</Text>
          <View style={styles.listContainer}>
            {detection.preventionTips.map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expert Consultation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consult with Experts</Text>
          {isLoadingExperts ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading experts...</Text>
            </View>
          ) : (
            <View style={styles.expertsContainer}>
              {availableExperts.filter(expert => expert.availability === 'available').map((expert) => (
                <View key={expert.id} style={styles.expertCard}>
                  <View style={styles.expertInfo}>
                    <Text style={styles.expertName}>{expert.expertName}</Text>
                    <Text style={styles.expertSpecialization}>{expert.specialization}</Text>
                    <Text style={styles.expertExperience}>{expert.experience} years experience</Text>
                    <View style={styles.expertRating}>
                      <IconSymbol name="star.fill" size={16} color={colors.warning} />
                      <Text style={styles.ratingText}>{expert.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.expertActions}>
                    <Text style={styles.consultationFee}>₹{expert.consultationFee}</Text>
                    <CustomButton
                      title="Consult"
                      onPress={() => handleConsultExpert(expert.id)}
                      style={styles.consultButton}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  center: {
    ...commonStyles.center,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    ...commonStyles.title,
    marginBottom: 0,
  },
  content: {
    ...commonStyles.content,
  },
  errorText: {
    ...commonStyles.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  diseaseCard: {
    ...commonStyles.card,
    marginBottom: 24,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.grey,
    borderRadius: 4,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  description: {
    ...commonStyles.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...commonStyles.subtitle,
    marginBottom: 12,
  },
  listContainer: {
    ...commonStyles.card,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    ...commonStyles.text,
    flex: 1,
    lineHeight: 22,
  },
  treatmentCard: {
    ...commonStyles.card,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTreatment: {
    borderColor: colors.primary,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  treatmentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  treatmentTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  treatmentDescription: {
    ...commonStyles.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  treatmentDetails: {
    gap: 4,
  },
  treatmentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treatmentDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  treatmentDetailValue: {
    fontSize: 14,
    color: colors.text,
  },
  loadingContainer: {
    ...commonStyles.card,
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    ...commonStyles.text,
  },
  expertsContainer: {
    gap: 12,
  },
  expertCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  expertSpecialization: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  expertExperience: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  expertRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  expertActions: {
    alignItems: 'center',
  },
  consultationFee: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  consultButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});

export default ResultsScreen;
