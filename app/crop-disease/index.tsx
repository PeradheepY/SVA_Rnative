
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../../src/store';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import CustomButton from '../../src/components/CustomButton';
import { detectCropDisease } from '../../src/services/cropDiseaseService';
import { setDetecting, setCurrentDetection, setError } from '../../src/store/slices/cropDiseaseSlice';

const { width } = Dimensions.get('window');

const CropDiseaseScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isDetecting, currentDetection, detectionHistory } = useSelector((state: RootState) => state.cropDisease);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to use this feature.');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        console.log('Image selected from gallery:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to use this feature.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        console.log('Photo taken:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    try {
      dispatch(setDetecting(true));
      const result = await detectCropDisease(selectedImage);
      dispatch(setCurrentDetection(result));
      router.push('/crop-disease/results');
    } catch (error) {
      console.error('Error analyzing image:', error);
      dispatch(setError('Failed to analyze image. Please try again.'));
      Alert.alert('Analysis Failed', 'Failed to analyze the image. Please try again.');
    }
  };

  const viewHistory = () => {
    router.push('/crop-disease/history');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={['#F8FAF9', '#E8F5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Plant Doctor</Text>
            <Text style={styles.headerSubtitle}>AI Disease Detection</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* Main Image Selection Area */}
        <View style={styles.mainSection}>
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <BlurView intensity={80} tint="light" style={[styles.changeImageBlur, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}>
                  <IconSymbol name="xmark.circle.fill" size={28} color={colors.error} />
                </BlurView>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPromptContainer}>
              <LinearGradient
                colors={['rgba(107, 207, 127, 0.08)', 'rgba(107, 207, 127, 0.02)']}
                style={styles.uploadPromptGradient}
              >
                <View style={styles.uploadIconContainer}>
                  <IconSymbol name="leaf.fill" size={48} color={colors.primary} />
                </View>
                <Text style={styles.uploadPromptTitle}>Scan Your Plant</Text>
                <Text style={styles.uploadPromptText}>
                  Take a photo or upload an image to detect diseases and get treatment recommendations
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionCard} onPress={takePhoto} activeOpacity={0.8}>
            <BlurView intensity={20} tint="light" style={styles.actionBlur}>
              <LinearGradient
                colors={['rgba(107, 207, 127, 0.15)', 'rgba(107, 207, 127, 0.05)']}
                style={styles.actionIconContainer}
              >
                <IconSymbol name="camera.fill" size={28} color={colors.primary} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Camera</Text>
              <Text style={styles.actionSubtitle}>Take Photo</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={pickImageFromGallery} activeOpacity={0.8}>
            <BlurView intensity={20} tint="light" style={styles.actionBlur}>
              <LinearGradient
                colors={['rgba(100, 181, 246, 0.15)', 'rgba(100, 181, 246, 0.05)']}
                style={styles.actionIconContainer}
              >
                <IconSymbol name="photo.fill" size={28} color={colors.accent} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Gallery</Text>
              <Text style={styles.actionSubtitle}>Upload Image</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        {selectedImage && (
          <TouchableOpacity 
            style={[styles.analyzeButton, isDetecting && styles.analyzeButtonDisabled]}
            onPress={analyzeImage}
            disabled={isDetecting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDetecting ? ['#A8E6B5', '#A8E6B5'] : [colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeButtonGradient}
            >
              {isDetecting ? (
                <>
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                  <View style={styles.analyzingDot} />
                </>
              ) : (
                <>
                  <IconSymbol name="wand.and.stars" size={20} color={colors.textWhite} />
                  <Text style={styles.analyzeButtonText}>Analyze Plant</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Recent Analysis */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            {detectionHistory.length > 0 && (
              <TouchableOpacity onPress={viewHistory}>
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>

          {detectionHistory.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <BlurView intensity={15} tint="light" style={styles.emptyStateBlur}>
                <IconSymbol name="tray.fill" size={40} color={colors.textLight} />
                <Text style={styles.emptyStateText}>No scans yet</Text>
                <Text style={styles.emptyStateSubtext}>Start by scanning your first plant</Text>
              </BlurView>
            </View>
          ) : (
            <View style={styles.historyList}>
              {detectionHistory.slice(0, 3).map((detection) => (
                <TouchableOpacity 
                  key={detection.id} 
                  style={styles.historyCard}
                  onPress={() => router.push(`/crop-disease/results?id=${detection.id}`)}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={15} tint="light" style={styles.historyBlur}>
                    <View style={styles.historyCardContent}>
                      <View style={styles.historyLeft}>
                        <View style={[styles.historyIconContainer, { 
                          backgroundColor: getSeverityColorLight(detection.severity) 
                        }]}>
                          <IconSymbol name="leaf.fill" size={20} color={getSeverityColor(detection.severity)} />
                        </View>
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyTitle}>{detection.diseaseName}</Text>
                          <Text style={styles.historySubtitle}>
                            {Math.round(detection.confidence * 100)}% confidence
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.severityBadge, { 
                        backgroundColor: getSeverityColorLight(detection.severity) 
                      }]}>
                        <Text style={[styles.severityText, { 
                          color: getSeverityColor(detection.severity) 
                        }]}>
                          {detection.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return colors.error;
    case 'medium': return colors.warning;
    case 'low': return colors.success;
    default: return colors.textSecondary;
  }
};

const getSeverityColorLight = (severity: string) => {
  switch (severity) {
    case 'high': return 'rgba(255, 107, 107, 0.12)';
    case 'medium': return 'rgba(255, 184, 77, 0.12)';
    case 'low': return 'rgba(81, 207, 102, 0.12)';
    default: return 'rgba(149, 165, 166, 0.12)';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  mainSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    height: 280,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  changeImageBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPromptContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  uploadPromptGradient: {
    padding: 40,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(107, 207, 127, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadPromptTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  uploadPromptText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionBlur: {
    borderRadius: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  analyzeButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textWhite,
  },
  analyzingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textWhite,
    marginLeft: 4,
  },
  historySection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyStateCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyStateBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textLight,
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  historyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CropDiseaseScreen;
