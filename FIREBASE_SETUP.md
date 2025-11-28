# Firebase Setup Guide for SVA AgroMart

## 🔥 Firebase Configuration Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `sva-agromart`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Add Android App

1. In Firebase Console, click on Android icon
2. Register app with package name: `com.sva.agromart` (from app.json)
3. Download `google-services.json`
4. Place it in your project root or android/app directory (when you build for production)

### 3. Add iOS App

1. Click on iOS icon
2. Register app with bundle ID: `com.sva.agromart`
3. Download `GoogleService-Info.plist`
4. Place it in your iOS project directory (when you build for production)

### 4. Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone**
3. Enable Phone sign-in
4. Save

### 5. Configure Environment Variables

Update the `.env` file with your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_from_firebase
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**To find these values:**
1. In Firebase Console, click on Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Select your app
4. Copy the configuration values

### 6. Development Mode

The app is currently configured for **development mode** which:
- Uses mock OTP verification (OTP: `123456`)
- Doesn't require actual Firebase phone auth setup
- Stores auth state locally

To test:
1. Enter any 10-digit phone number
2. Select role (Farmer or Retailer)
3. Click "Send OTP"
4. Enter OTP: `123456`
5. Login successful!

### 7. Production Mode

To enable real Firebase phone authentication:

1. Update `.env`:
   ```env
   EXPO_PUBLIC_APP_ENV=production
   ```

2. For **Web/Expo Go**: Configure reCAPTCHA
   - Add a `<div id="recaptcha-container"></div>` in your HTML
   - Firebase will use this for bot verification

3. For **Native Apps**: 
   - Configure Firebase properly with SHA-1/SHA-256 keys
   - Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Build with EAS: `eas build --platform android`

### 8. Testing Phone Auth in Production

**For India (+91):**
- Phone numbers must be real and can receive SMS
- Firebase free tier: 10,000 verifications/month

**Test Phone Numbers** (Development only):
1. Go to Firebase Console → Authentication → Sign-in method
2. Scroll to "Phone numbers for testing"
3. Add test numbers with predefined OTPs

Example:
- Phone: `+919999999999`
- Code: `123456`

## 🔒 Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Firebase App Check** for production to prevent abuse
3. **Set up Firebase Security Rules** for database/storage
4. **Enable Multi-factor Authentication** for admin accounts

## 📱 Current Authentication Flow

1. User enters phone number (10 digits)
2. Selects role: Farmer or Retailer
3. Clicks "Send OTP"
4. Receives OTP via SMS (or uses mock OTP in dev mode)
5. Enters 6-digit OTP
6. Account created/logged in automatically
7. Auth state persisted with AsyncStorage
8. Auto-login on app restart

## 🛠️ Troubleshooting

### Issue: OTP not received
- Check phone number format (+91XXXXXXXXXX)
- Verify Firebase Phone Auth is enabled
- Check Firebase quota limits
- For development, use mock OTP: `123456`

### Issue: "Invalid app credential"
- Verify Firebase config in `.env`
- Ensure all Firebase keys are correct
- Check Firebase project is active

### Issue: App crashes on login
- Check AsyncStorage is properly linked
- Verify Redux store configuration
- Clear app storage and restart

## 📚 Additional Resources

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Expo Firebase Setup](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)
