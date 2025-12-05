// Image upload service using Cloudinary (FREE tier available)
// Cloudinary Free: 25GB storage, 25GB bandwidth/month

// Hardcoded values since process.env is not loading properly in Expo
const CLOUDINARY_CLOUD_NAME = 'dkbphnjpb';
const CLOUDINARY_UPLOAD_PRESET = 'sva_agromart';

/**
 * Upload image to Cloudinary (FREE)
 * @param uri - Local image URI from device
 * @param folder - Folder name in Cloudinary
 * @returns Download URL of uploaded image
 */
export const uploadImage = async (uri: string, folder: string = 'products'): Promise<string> => {
  try {
    console.log('📤 Uploading image to Cloudinary...');
    console.log('🔧 Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('🔧 Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary credentials not configured. Check .env file.');
    }
    
    // Create form data
    const formData = new FormData();
    
    // Get file extension
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri,
      type: `image/${fileType}`,
      name: `upload.${fileType}`,
    } as any);
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    console.log('✅ Image uploaded successfully');
    console.log('📎 URL:', data.secure_url);
    
    return data.secure_url;
  } catch (error: any) {
    console.error('❌ Error uploading image:', error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload product image
 * @param uri - Local image URI
 * @param productName - Product name for organization
 * @param retailerId - Retailer UID
 * @returns Download URL
 */
export const uploadProductImage = async (
  uri: string,
  productName: string,
  retailerId: string
): Promise<string> => {
  const folder = `sva_agromart/products/${retailerId}`;
  return uploadImage(uri, folder);
};

/**
 * Upload user profile image
 * @param uri - Local image URI
 * @param userId - User UID
 * @returns Download URL
 */
export const uploadProfileImage = async (
  uri: string,
  userId: string
): Promise<string> => {
  const folder = `sva_agromart/profiles`;
  return uploadImage(uri, folder);
};
