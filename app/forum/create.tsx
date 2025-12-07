import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';
import { RootState } from '../../src/store';
import {
  createPost,
  uploadImageToCloudinary,
  PostCategory,
  CATEGORY_INFO,
} from '../../src/services/forumService';

const CreatePostScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleImagePick = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content for your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to create a post');
      return;
    }

    setIsLoading(true);

    try {
      let uploadedImageUrl: string | undefined;

      // Upload image if selected
      if (imageUri) {
        setUploadingImage(true);
        uploadedImageUrl = await uploadImageToCloudinary(imageUri);
        setUploadingImage(false);
      }

      // Create post
      await createPost({
        title: title.trim(),
        content: content.trim(),
        authorId: user.uid,
        authorName: user.name || user.phoneNumber || 'Anonymous',
        authorAvatar: undefined,
        imageUrl: uploadedImageUrl,
        category,
        tags: [],
      });

      Alert.alert('Success', 'Your post has been published!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  const categories = Object.entries(CATEGORY_INFO) as [PostCategory, typeof CATEGORY_INFO[PostCategory]][];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={['#6BCF7F', '#5AB96D']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            style={[styles.postButton, (!title.trim() || !content.trim()) && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || !title.trim() || !content.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(([key, info]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryChip,
                category === key && { backgroundColor: info.color },
              ]}
              onPress={() => setCategory(key)}
            >
              <Text style={styles.categoryEmoji}>{info.emoji}</Text>
              <Text
                style={[
                  styles.categoryText,
                  category === key && styles.categoryTextSelected,
                ]}
              >
                {info.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title Input */}
        <Text style={styles.sectionLabel}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What's your question or topic?"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <Text style={styles.charCount}>{title.length}/100</Text>

        {/* Content Input */}
        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Describe your question or share your experience in detail..."
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={styles.charCount}>{content.length}/2000</Text>

        {/* Image Section */}
        <Text style={styles.sectionLabel}>Add Photo (Optional)</Text>
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <IconSymbol name="xmark.circle.fill" size={28} color="#FF5252" />
            </TouchableOpacity>
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
            <IconSymbol name="camera.fill" size={32} color={colors.primary} />
            <Text style={styles.addImageText}>Add a photo</Text>
            <Text style={styles.addImageSubtext}>Help others understand better</Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips for a great post:</Text>
          <Text style={styles.tipText}>• Be specific and clear in your question</Text>
          <Text style={styles.tipText}>• Add photos to show the issue</Text>
          <Text style={styles.tipText}>• Choose the right category</Text>
          <Text style={styles.tipText}>• Mention your location/region if relevant</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  postButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginTop: 16,
  },
  categoryScroll: {
    marginHorizontal: -16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  contentInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addImageButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 10,
  },
  addImageSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  uploadingText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default CreatePostScreen;
