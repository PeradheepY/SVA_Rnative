
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../src/store';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import { DiseaseDetectionResult } from '../../src/services/cropDiseaseService';

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { detectionHistory } = useSelector((state: RootState) => state.cropDisease);

  const handleBack = () => {
    router.back();
  };

  const handleResultPress = (detection: DiseaseDetectionResult) => {
    // Navigate to results screen with the specific detection
    router.push(`/crop-disease/results?id=${detection.id}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const renderHistoryItem = ({ item }: { item: DiseaseDetectionResult }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.historyItemContent}>
        <View style={styles.historyItemHeader}>
          <Text style={styles.historyItemTitle}>{item.diseaseName}</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.historyItemSubtitle} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.historyItemFooter}>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(item.confidence * 100)}%
          </Text>
          <Text style={styles.affectedCropsText}>
            Affects: {item.affectedCrops.join(', ')}
          </Text>
        </View>
      </View>
      
      <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detection History</Text>
      </View>

      {detectionHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="clock" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>No History Yet</Text>
          <Text style={styles.emptyStateText}>
            Your crop disease detection history will appear here once you start analyzing images.
          </Text>
        </View>
      ) : (
        <FlatList
          data={detectionHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateText: {
    ...commonStyles.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  historyItem: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  historyItemSubtitle: {
    ...commonStyles.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  historyItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  affectedCropsText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
});

export default HistoryScreen;
