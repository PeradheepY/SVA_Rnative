import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import { RootState } from '../../src/store';
import {
  ForumPost,
  Reply,
  getPostById,
  getReplies,
  addReply,
  togglePostLike,
  toggleReplyLike,
  markPostResolved,
  formatTimeAgo,
  CATEGORY_INFO,
} from '../../src/services/forumService';

const PostDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const scrollViewRef = useRef<ScrollView>(null);

  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    loadPostAndReplies();
  }, [id]);

  const loadPostAndReplies = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const [postData, repliesData] = await Promise.all([
        getPostById(id),
        getReplies(id),
      ]);
      setPost(postData);
      setReplies(repliesData);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!post || !user || isLiking) return;

    setIsLiking(true);
    try {
      const isNowLiked = await togglePostLike(post.id, user.uid);
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: isNowLiked ? prev.likes + 1 : prev.likes - 1,
          likedBy: isNowLiked
            ? [...prev.likedBy, user.uid]
            : prev.likedBy.filter((id) => id !== user.uid),
        };
      });
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!post || !user) return;

    try {
      const isNowLiked = await toggleReplyLike(post.id, replyId, user.uid);
      setReplies((prev) =>
        prev.map((reply) => {
          if (reply.id === replyId) {
            return {
              ...reply,
              likes: isNowLiked ? reply.likes + 1 : reply.likes - 1,
              likedBy: isNowLiked
                ? [...reply.likedBy, user.uid]
                : reply.likedBy.filter((id) => id !== user.uid),
            };
          }
          return reply;
        })
      );
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !post || !user) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const replyId = await addReply(post.id, {
        content: replyText.trim(),
        authorId: user.uid,
        authorName: user.name || user.phoneNumber || 'Anonymous',
        authorAvatar: undefined,
      });

      // Add the new reply to the list
      const newReply: Reply = {
        id: replyId,
        postId: post.id,
        content: replyText.trim(),
        authorId: user.uid,
        authorName: user.name || user.phoneNumber || 'Anonymous',
        authorAvatar: undefined,
        likes: 0,
        likedBy: [],
        createdAt: new Date(),
      };

      setReplies((prev) => [...prev, newReply]);
      setPost((prev) => (prev ? { ...prev, repliesCount: prev.repliesCount + 1 } : prev));
      setReplyText('');

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error submitting reply:', error);
      Alert.alert('Error', 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!post || !user || post.authorId !== user.uid) return;

    Alert.alert(
      'Mark as Resolved',
      'This will mark your question as resolved. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Resolved',
          onPress: async () => {
            try {
              await markPostResolved(post.id, user.uid);
              setPost((prev) => (prev ? { ...prev, isResolved: true } : prev));
            } catch (error) {
              console.error('Error marking resolved:', error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity style={styles.backButtonAlt} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryInfo = CATEGORY_INFO[post.category];
  const isLiked = user && post.likedBy.includes(user.uid);
  const isAuthor = user && post.authorId === user.uid;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <LinearGradient colors={['#6BCF7F', '#5AB96D']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Discussion
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
              <Text style={styles.categoryBadgeText}>
                {categoryInfo.emoji} {categoryInfo.label}
              </Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post Content */}
        <View style={styles.postCard}>
          {/* Resolved Badge */}
          {post.isResolved && (
            <View style={styles.resolvedBadge}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          )}

          {/* Author Info */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              {post.authorAvatar ? (
                <Image source={{ uri: post.authorAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{post.authorName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
            </View>
            {isAuthor && !post.isResolved && (
              <TouchableOpacity style={styles.resolveButton} onPress={handleMarkResolved}>
                <Text style={styles.resolveButtonText}>Mark Resolved</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text style={styles.postTitle}>{post.title}</Text>

          {/* Content */}
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Image */}
          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
          )}

          {/* Stats & Actions */}
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <IconSymbol name="eye" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{post.views} views</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="bubble.left" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{post.repliesCount} replies</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, isLiked && styles.actionButtonActive]}
              onPress={handleLikePost}
              disabled={isLiking}
            >
              <IconSymbol
                name={isLiked ? 'heart.fill' : 'heart'}
                size={20}
                color={isLiked ? '#FF5252' : colors.textSecondary}
              />
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                {post.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="square.and.arrow.up" size={20} color={colors.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            💬 Replies ({replies.length})
          </Text>

          {replies.length === 0 ? (
            <View style={styles.noReplies}>
              <Text style={styles.noRepliesText}>No replies yet. Be the first to respond!</Text>
            </View>
          ) : (
            replies.map((reply) => {
              const replyLiked = user && reply.likedBy.includes(user.uid);
              return (
                <View key={reply.id} style={styles.replyCard}>
                  <View style={styles.replyAuthorRow}>
                    <View style={styles.replyAvatar}>
                      {reply.authorAvatar ? (
                        <Image source={{ uri: reply.authorAvatar }} style={styles.replyAvatarImage} />
                      ) : (
                        <Text style={styles.replyAvatarText}>
                          {reply.authorName.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.replyAuthorInfo}>
                      <Text style={styles.replyAuthorName}>{reply.authorName}</Text>
                      <Text style={styles.replyTime}>{formatTimeAgo(reply.createdAt)}</Text>
                    </View>
                    {reply.isExpertReply && (
                      <View style={styles.expertBadge}>
                        <Text style={styles.expertBadgeText}>Expert</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.replyContent}>{reply.content}</Text>
                  <TouchableOpacity
                    style={styles.replyLikeButton}
                    onPress={() => handleLikeReply(reply.id)}
                  >
                    <IconSymbol
                      name={replyLiked ? 'heart.fill' : 'heart'}
                      size={16}
                      color={replyLiked ? '#FF5252' : colors.textSecondary}
                    />
                    <Text style={[styles.replyLikeText, replyLiked && { color: '#FF5252' }]}>
                      {reply.likes}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reply Input */}
      <View style={styles.replyInputContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Write a reply..."
          placeholderTextColor={colors.textSecondary}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmitReply}
          disabled={isSubmitting || !replyText.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F9F6',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  backButtonAlt: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  postTime: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resolveButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resolveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  postStats: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  actionButtonActive: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionTextActive: {
    color: '#FF5252',
  },
  repliesSection: {
    marginTop: 24,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  noReplies: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noRepliesText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  replyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  replyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  replyAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  replyAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  replyAuthorInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  replyTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  expertBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  expertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9800',
  },
  replyContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  replyLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  replyLikeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    fontSize: 15,
    maxHeight: 100,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default PostDetailScreen;
