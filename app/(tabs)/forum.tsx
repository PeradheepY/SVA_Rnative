import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import { RootState } from '../../src/store';
import {
  ForumPost,
  PostCategory,
  subscribeToForumPosts,
  togglePostLike,
  formatTimeAgo,
  CATEGORY_INFO,
} from '../../src/services/forumService';
import { getAgriNews, NewsItem } from '../../src/services/newsService';

type TabType = 'discussions' | 'news';

const ForumScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<TabType>('discussions');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);

  // Subscribe to forum posts
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToForumPosts(
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        setIsLoading(false);
      },
      selectedCategory || undefined
    );

    return () => unsubscribe();
  }, [selectedCategory]);

  // Load news when tab changes
  useEffect(() => {
    if (activeTab === 'news' && news.length === 0) {
      loadNews();
    }
  }, [activeTab]);

  const loadNews = async () => {
    setNewsLoading(true);
    try {
      const newsData = await getAgriNews();
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'news') {
      await loadNews();
    }
    setRefreshing(false);
  }, [activeTab]);

  const handleAskQuestion = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push('/forum/create');
  };

  const handlePostPress = (postId: string) => {
    router.push(`/forum/${postId}`);
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const isNowLiked = await togglePostLike(postId, user.uid);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isNowLiked ? post.likes + 1 : post.likes - 1,
              likedBy: isNowLiked
                ? [...post.likedBy, user.uid]
                : post.likedBy.filter((id) => id !== user.uid),
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const categories = Object.entries(CATEGORY_INFO) as [PostCategory, typeof CATEGORY_INFO[PostCategory]][];

  const renderPost = (post: ForumPost) => {
    const categoryInfo = CATEGORY_INFO[post.category];
    const isLiked = user && post.likedBy?.includes(user.uid);

    return (
      <TouchableOpacity
        key={post.id}
        style={styles.postCard}
        onPress={() => handlePostPress(post.id)}
        activeOpacity={0.8}
      >
        <View style={styles.postBlur}>
          {/* Category Badge */}
          <View style={[styles.categoryTag, { backgroundColor: categoryInfo.color + '20' }]}>
            <Text style={styles.categoryTagEmoji}>{categoryInfo.emoji}</Text>
            <Text style={[styles.categoryTagText, { color: categoryInfo.color }]}>{categoryInfo.label}</Text>
          </View>

          <View style={styles.postHeader}>
            <View style={styles.authorAvatar}>
              {post.authorAvatar ? (
                <Image source={{ uri: post.authorAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.authorInitial}>{post.authorName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.postHeaderInfo}>
              <Text style={styles.postAuthor}>{post.authorName}</Text>
              <Text style={styles.postTimestamp}>{formatTimeAgo(post.createdAt)}</Text>
            </View>
            {post.isResolved && (
              <View style={styles.resolvedBadge}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#4CAF50" />
              </View>
            )}
          </View>
          
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
          
          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          )}
          
          <View style={styles.postFooter}>
            <View style={styles.repliesContainer}>
              <IconSymbol name="bubble.left.fill" size={16} color={colors.primary} />
              <Text style={styles.repliesCount}>{post.repliesCount} replies</Text>
            </View>
            <TouchableOpacity 
              style={styles.likeContainer}
              onPress={(e) => {
                e.stopPropagation();
                handleLikePost(post.id);
              }}
            >
              <IconSymbol 
                name={isLiked ? "heart.fill" : "heart"} 
                size={16} 
                color={isLiked ? "#FF5252" : colors.textSecondary} 
              />
              <Text style={[styles.likeCount, isLiked && { color: '#FF5252' }]}>{post.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewsItem = (item: NewsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.newsCard}
      onPress={() => item.url && router.push(item.url as any)}
      activeOpacity={0.8}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      )}
      <View style={styles.newsContent}>
        <View style={[styles.newsTypeBadge, { backgroundColor: getNewsTypeColor(item.type) + '20' }]}>
          <Text style={[styles.newsTypeText, { color: getNewsTypeColor(item.type) }]}>
            {getNewsTypeEmoji(item.type)} {item.type.replace('_', ' ')}
          </Text>
        </View>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDate}>{formatTimeAgo(item.publishedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getNewsTypeColor = (type: string): string => {
    switch (type) {
      case 'govt_scheme': return '#9C27B0';
      case 'weather_alert': return '#FF5722';
      case 'market_price': return '#FF9800';
      case 'subsidy': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getNewsTypeEmoji = (type: string): string => {
    switch (type) {
      case 'govt_scheme': return '📋';
      case 'weather_alert': return '⚠️';
      case 'market_price': return '💰';
      case 'subsidy': return '🏛️';
      default: return '📰';
    }
  };

  return (
    <View style={styles.container}>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#6BCF7F', '#5AB96D']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>💬 Community</Text>
            <Text style={styles.headerSubtitle}>Forum & News</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <BlurView intensity={20} style={styles.notificationBlur}>
              <IconSymbol name="bell.fill" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'discussions' && styles.activeTab]}
            onPress={() => setActiveTab('discussions')}
          >
            <Text style={[styles.tabText, activeTab === 'discussions' && styles.activeTabText]}>
              💬 Discussions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'news' && styles.activeTab]}
            onPress={() => setActiveTab('news')}
          >
            <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
              📰 Agri News
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ask Question Button - Only for discussions */}
        {activeTab === 'discussions' && (
          <TouchableOpacity style={styles.askQuestionButton} onPress={handleAskQuestion}>
            <BlurView intensity={20} style={styles.askQuestionBlur}>
              <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
              <Text style={styles.askQuestionText}>{t('askQuestion')}</Text>
            </BlurView>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {activeTab === 'discussions' ? (
          <>
            {/* Category Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <TouchableOpacity
                style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(([key, info]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterChip,
                    selectedCategory === key && styles.filterChipActive,
                    selectedCategory === key && { backgroundColor: info.color },
                  ]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <Text style={styles.filterEmoji}>{info.emoji}</Text>
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === key && styles.filterChipTextActive,
                  ]}>
                    {info.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Trending Discussions</Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>No discussions yet</Text>
                <Text style={styles.emptyText}>Be the first to start a conversation!</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={handleAskQuestion}>
                  <Text style={styles.emptyButtonText}>Ask a Question</Text>
                </TouchableOpacity>
              </View>
            ) : (
              posts.map(renderPost)
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📰 Latest Agriculture News</Text>
            </View>

            {newsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : news.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📰</Text>
                <Text style={styles.emptyTitle}>No news available</Text>
                <Text style={styles.emptyText}>Check back later for updates</Text>
              </View>
            ) : (
              news.map(renderNewsItem)
            )}
          </>
        )}
        <View style={{ height: 100 }} />
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
    marginBottom: 16,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  activeTabText: {
    color: colors.primary,
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
  categoryScroll: {
    marginTop: 16,
    marginHorizontal: -16,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
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
    backgroundColor: '#fff',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryTagEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  resolvedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  // News styles
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 160,
  },
  newsContent: {
    padding: 16,
  },
  newsTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  newsTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  newsDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  newsDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ForumScreen;
