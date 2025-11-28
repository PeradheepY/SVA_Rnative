
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  timestamp: string;
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best fertilizer for wheat crop?',
    author: 'Rajesh Kumar',
    content: 'I am planning to grow wheat this season. Can anyone suggest the best fertilizer for maximum yield?',
    replies: 12,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Pest control for tomatoes',
    author: 'Priya Sharma',
    content: 'My tomato plants are being attacked by pests. Looking for organic solutions.',
    replies: 8,
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    title: 'Government subsidy for drip irrigation',
    author: 'Amit Singh',
    content: 'Does anyone know about the latest government schemes for drip irrigation systems?',
    replies: 15,
    timestamp: '1 day ago',
  },
];

const ForumScreen: React.FC = () => {
  const { t } = useTranslation();

  const handleAskQuestion = () => {
    console.log('Ask question pressed');
    // Navigate to ask question screen
  };

  const handlePostPress = (postId: string) => {
    console.log('Post pressed:', postId);
    // Navigate to post details
  };

  const renderPost = (post: ForumPost) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      onPress={() => handlePostPress(post.id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={15} tint="light" style={styles.postBlur}>
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>{post.author.charAt(0)}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postTimestamp}>{post.timestamp}</Text>
          </View>
        </View>
        
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
        
        <View style={styles.postFooter}>
          <View style={styles.repliesContainer}>
            <IconSymbol name="bubble.left.fill" size={16} color={colors.primary} />
            <Text style={styles.repliesCount}>{post.replies} replies</Text>
          </View>
          <View style={styles.likeContainer}>
            <IconSymbol name="heart" size={16} color={colors.textSecondary} />
            <Text style={styles.likeCount}>24</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#6BCF7F', '#5AB96D']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>💬 Community Forum</Text>
            <Text style={styles.headerSubtitle}>Connect with farmers</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <BlurView intensity={20} style={styles.notificationBlur}>
              <IconSymbol name="bell.fill" size={22} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>5</Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Ask Question Button */}
        <TouchableOpacity style={styles.askQuestionButton} onPress={handleAskQuestion}>
          <BlurView intensity={20} style={styles.askQuestionBlur}>
            <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
            <Text style={styles.askQuestionText}>{t('askQuestion')}</Text>
          </BlurView>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trending Discussions</Text>
        </View>
        {mockPosts.map(renderPost)}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  gradientHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  notificationButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  notificationBlur: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  askQuestionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  askQuestionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  askQuestionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postBlur: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  repliesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repliesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
});

export default ForumScreen;
