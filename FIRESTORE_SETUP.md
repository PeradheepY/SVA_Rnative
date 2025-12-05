# Firestore Database Setup Guide

## Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose **Start in test mode** (for development)
6. Select your preferred location (closest to your users)

## Step 2: Set Firestore Security Rules

Go to **Firestore Database → Rules** and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products collection
    // - Anyone can read products (farmers can browse)
    // - Only authenticated users can create products
    // - Only the retailer who created the product can update/delete
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.retailerId;
    }
    
    // Users collection
    // - Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection (for future use)
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.customerId || 
         request.auth.uid == resource.data.retailerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.retailerId;
    }
  }
}
```

Click **Publish** to apply the rules.

## Step 3: Set Up Cloudinary for Image Upload (FREE)

Firebase Storage requires paid plan. We use **Cloudinary** instead (FREE tier: 25GB storage, 25GB bandwidth/month).

### 3.1 Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up (FREE)
2. After signup, go to **Dashboard**
3. Note your **Cloud Name** (shown at top)

### 3.2 Create Upload Preset
1. Go to **Settings → Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Preset name**: `sva_agromart` (or any name)
   - **Signing Mode**: `Unsigned` (important!)
   - **Folder**: `sva_agromart`
5. Click **Save**

### 3.3 Add to Environment Variables
Add these to your `.env` file:

```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sva_agromart
```

## Step 4: Create Indexes (Optional - Auto-created)

The app will work without manually creating indexes. When you first query, Firebase will show an error with a link to auto-create the required index.

**Or manually create these composite indexes:**

Go to **Firestore Database → Indexes → Composite**

| Collection | Field 1 | Field 2 | Status |
|------------|---------|---------|--------|
| products | category (Asc) | createdAt (Desc) | Required |
| products | retailerId (Asc) | createdAt (Desc) | Required |

## Step 5: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Cloudinary Configuration (FREE image hosting)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sva_agromart

# App Environment
EXPO_PUBLIC_APP_ENV=development
```

**Find these values in Firebase Console:**
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Select your web app
4. Copy the config values

## Step 5: Restart Your App

After setting up everything:

```bash
# Stop the current server (Ctrl+C)
# Start fresh
npx expo start -c
```

The `-c` flag clears the cache.

## Database Structure

### Products Collection (`/products/{productId}`)

```json
{
  "name": "Premium Wheat Seeds",
  "price": 450,
  "image": "https://...",
  "category": "seeds",
  "description": "High-quality wheat seeds...",
  "rating": 4.5,
  "reviews": 128,
  "inStock": true,
  "quantity": 100,
  "retailerId": "user_uid_here",
  "retailerName": "ABC Agro Store",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Users Collection (`/users/{userId}`)

```json
{
  "uid": "user_uid",
  "phoneNumber": "+919876543210",
  "role": "retailer",
  "name": "Shop Owner Name",
  "gstin": "22AAAAA0000A1Z5",
  "shopName": "ABC Agro Store",
  "shopAddress": "123 Main Street",
  "isVerified": false,
  "createdAt": "Timestamp",
  "lastLogin": "Timestamp"
}
```

## How It Works

1. **Retailer adds product** → Saved to Firestore `products` collection
2. **Farmer opens Shop** → App fetches from Firestore
3. **Real-time sync** → Products appear immediately

## Troubleshooting

### "Permission Denied" Error
- Check if security rules are published
- Make sure user is authenticated
- Verify retailerId matches the logged-in user

### "Index Required" Error
- Click the link in the error message
- Firebase will auto-create the index
- Wait 1-2 minutes for index to build

### Products Not Showing
- Check browser console for errors
- Verify Firebase config in `.env`
- Make sure Firestore is initialized

### Mock Data Still Showing
- This means Firestore is empty or has an error
- Add a product through the retailer dashboard
- Check console logs for connection issues
