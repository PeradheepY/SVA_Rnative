import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkbphnjpb';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sva_agromart';

// Interfaces
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  imageUrl?: string;
  category: PostCategory;
  likes: number;
  likedBy: string[];
  repliesCount: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  isResolved?: boolean;
  tags?: string[];
}

export interface Reply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  isExpertReply?: boolean;
}

export type PostCategory = 
  | 'crops'
  | 'pests'
  | 'equipment'
  | 'schemes'
  | 'market'
  | 'weather'
  | 'general';

export const CATEGORY_INFO: Record<PostCategory, { label: string; emoji: string; color: string }> = {
  crops: { label: 'Crops & Farming', emoji: '🌾', color: '#4CAF50' },
  pests: { label: 'Pests & Diseases', emoji: '🐛', color: '#F44336' },
  equipment: { label: 'Equipment', emoji: '🚜', color: '#2196F3' },
  schemes: { label: 'Govt Schemes', emoji: '📋', color: '#9C27B0' },
  market: { label: 'Market Prices', emoji: '💰', color: '#FF9800' },
  weather: { label: 'Weather', emoji: '🌤️', color: '#00BCD4' },
  general: { label: 'General', emoji: '💬', color: '#607D8B' },
};

// Upload image to Cloudinary
export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    
    // Get file extension
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `forum_${Date.now()}.${fileType}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'forum_posts');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (
  postData: Omit<ForumPost, 'id' | 'likes' | 'likedBy' | 'repliesCount' | 'views' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const postsRef = collection(db, 'forumPosts');
    
    // Build post object, excluding undefined values (Firestore doesn't accept undefined)
    const newPost: Record<string, any> = {
      title: postData.title,
      content: postData.content,
      authorId: postData.authorId,
      authorName: postData.authorName,
      category: postData.category,
      likes: 0,
      likedBy: [],
      repliesCount: 0,
      views: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isResolved: false,
    };

    // Only add optional fields if they have values
    if (postData.authorAvatar) {
      newPost.authorAvatar = postData.authorAvatar;
    }
    if (postData.imageUrl) {
      newPost.imageUrl = postData.imageUrl;
    }
    if (postData.tags && postData.tags.length > 0) {
      newPost.tags = postData.tags;
    }

    const docRef = await addDoc(postsRef, newPost);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get all posts with optional category filter
export const getPosts = async (
  category?: PostCategory,
  limitCount: number = 20
): Promise<ForumPost[]> => {
  try {
    const postsRef = collection(db, 'forumPosts');
    let q;

    if (category) {
      q = query(
        postsRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(postsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ForumPost[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get single post by ID
export const getPostById = async (postId: string): Promise<ForumPost | null> => {
  try {
    const postRef = doc(db, 'forumPosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return null;
    }

    // Increment view count
    await updateDoc(postRef, {
      views: increment(1),
    });

    const data = postSnap.data();
    return {
      id: postSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ForumPost;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// Like/Unlike a post
export const togglePostLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'forumPosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const likedBy = postSnap.data().likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
      return false;
    } else {
      // Like
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Add a reply to a post
export const addReply = async (
  postId: string,
  replyData: Omit<Reply, 'id' | 'postId' | 'likes' | 'likedBy' | 'createdAt'>
): Promise<string> => {
  try {
    const repliesRef = collection(db, 'forumPosts', postId, 'replies');
    
    // Build reply object, excluding undefined values
    const newReply: Record<string, any> = {
      content: replyData.content,
      authorId: replyData.authorId,
      authorName: replyData.authorName,
      postId,
      likes: 0,
      likedBy: [],
      createdAt: Timestamp.now(),
    };

    // Only add optional fields if they have values
    if (replyData.authorAvatar) {
      newReply.authorAvatar = replyData.authorAvatar;
    }
    if (replyData.isExpertReply) {
      newReply.isExpertReply = replyData.isExpertReply;
    }

    const docRef = await addDoc(repliesRef, newReply);

    // Update reply count on the post
    const postRef = doc(db, 'forumPosts', postId);
    await updateDoc(postRef, {
      repliesCount: increment(1),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// Get replies for a post
export const getReplies = async (postId: string): Promise<Reply[]> => {
  try {
    const repliesRef = collection(db, 'forumPosts', postId, 'replies');
    const q = query(repliesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Reply[];
  } catch (error) {
    console.error('Error getting replies:', error);
    throw error;
  }
};

// Like/Unlike a reply
export const toggleReplyLike = async (
  postId: string,
  replyId: string,
  userId: string
): Promise<boolean> => {
  try {
    const replyRef = doc(db, 'forumPosts', postId, 'replies', replyId);
    const replySnap = await getDoc(replyRef);

    if (!replySnap.exists()) {
      throw new Error('Reply not found');
    }

    const likedBy = replySnap.data().likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      await updateDoc(replyRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
      return false;
    } else {
      await updateDoc(replyRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling reply like:', error);
    throw error;
  }
};

// Get user's posts
export const getUserPosts = async (userId: string): Promise<ForumPost[]> => {
  try {
    const postsRef = collection(db, 'forumPosts');
    const q = query(
      postsRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ForumPost[];
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

// Delete a post (only by author)
export const deletePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'forumPosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    if (postSnap.data().authorId !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Mark post as resolved
export const markPostResolved = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'forumPosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    if (postSnap.data().authorId !== userId) {
      throw new Error('Not authorized to update this post');
    }

    await updateDoc(postRef, {
      isResolved: true,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking post as resolved:', error);
    throw error;
  }
};

// Real-time listener for posts
export const subscribeToForumPosts = (
  callback: (posts: ForumPost[]) => void,
  category?: PostCategory
) => {
  const postsRef = collection(db, 'forumPosts');
  let q;

  if (category) {
    q = query(
      postsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  } else {
    q = query(postsRef, orderBy('createdAt', 'desc'), limit(50));
  }

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ForumPost[];
    callback(posts);
  });
};

// Helper to format time ago
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
