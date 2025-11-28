# 🧪 Quick Testing Guide

## Test the New Authentication System

### 1️⃣ Start the App
```bash
npx expo start
```
Then press `a` for Android or `i` for iOS

### 2️⃣ Test Login Flow

**Step 1: Enter Phone Number**
- Open the app → Login screen appears
- Enter: `9876543210` (any 10 digits work)
- Select role: Click "Farmer" or "Retailer" button
- Click "Send OTP"

**Step 2: Verify OTP**
- You'll see a yellow banner: "Development Mode - Use OTP: 123456"
- Enter OTP: `1` `2` `3` `4` `5` `6`
- Notice:
  - Auto-advances to next box
  - Can use backspace to go back
  - Timer shows "Resend in 60s"
- Click "Verify OTP"

**Step 3: Success!**
- Automatically redirected to Home screen
- See personalized greeting
- Check Profile tab to see your role

### 3️⃣ Test Session Persistence

**Close and Reopen App:**
1. Close the app completely (swipe away)
2. Reopen the app
3. ✅ Should go directly to Home (not login screen)
4. Your session is restored!

### 4️⃣ Test Logout

**Logout Process:**
1. Go to Profile tab
2. Scroll down
3. Click "Logout" button
4. Confirm logout
5. ✅ Redirected to login screen
6. Session cleared

### 5️⃣ Test Different Roles

**Test as Farmer:**
- Phone: `9876543210`
- Role: Select "Farmer"
- OTP: `123456`
- Check Profile → Shows "Farmer"

**Test as Retailer:**
- Logout first
- Phone: `9999999999`
- Role: Select "Retailer"
- OTP: `123456`
- Check Profile → Shows "Retailer"

### 6️⃣ Test Edge Cases

**Invalid Phone Number:**
- Enter: `123` (less than 10 digits)
- Try to send OTP
- ✅ Should show error: "Please enter a valid 10-digit phone number"

**No Role Selected:**
- Enter phone: `9876543210`
- Don't select any role
- Try to send OTP
- ✅ Should show error: "Please enter phone number and select role"

**Wrong OTP:**
- Enter phone and send OTP
- Enter wrong OTP: `000000`
- Click Verify
- ✅ Should show error: "Invalid OTP code"

**Resend OTP:**
- Send OTP
- Wait 60 seconds
- Click "Resend OTP"
- ✅ Timer resets to 60s
- ✅ Shows success message

### 7️⃣ Expected UI Elements

**Login Screen:**
- 🌱 Green logo emoji
- "Welcome to SVA AgroMart" title
- Phone number input (10 digits)
- Two role buttons: Farmer & Retailer
- "Send OTP" button (disabled until ready)

**OTP Screen:**
- 🔐 Lock emoji
- Phone number displayed
- 6 OTP input boxes
- Yellow dev mode banner (in development)
- "Verify OTP" button
- Resend timer
- "Change Phone Number" link

**Home Screen:**
- "Good Morning" greeting
- User name displayed
- Weather widget
- Category cards (Seeds, Fertilizers, Pesticides)
- Quick actions

**Profile Screen:**
- User avatar (👤 emoji)
- User name
- Phone number (formatted with +91)
- Role (Farmer or Retailer in correct language)
- Language toggle (English/हिंदी)
- Logout button

## 🎯 Success Criteria

All these should work:
- ✅ Can login with any 10-digit number
- ✅ Can select Farmer or Retailer role
- ✅ OTP screen shows and accepts 123456
- ✅ Auto-advances through OTP boxes
- ✅ Successfully logs in and shows home screen
- ✅ Profile shows correct phone and role
- ✅ Can logout successfully
- ✅ Session persists on app restart
- ✅ Can switch between English and Hindi
- ✅ All error cases handled properly

## 🚨 Common Issues

### Issue: "Send OTP" button doesn't work
- **Check:** Phone number has 10 digits
- **Check:** Role is selected
- **Solution:** Ensure both are filled

### Issue: OTP verification fails
- **Check:** Using OTP `123456`
- **Check:** All 6 digits entered
- **Solution:** Re-enter the OTP

### Issue: App crashes on login
- **Check:** Run `npm install` again
- **Check:** Restart Metro bundler
- **Solution:** Clear cache: `npx expo start -c`

### Issue: Not auto-logging in
- **Check:** Logged in at least once before
- **Check:** AsyncStorage working
- **Solution:** Login again, should work next time

## 📸 Screenshot Checklist

If you want to document, capture:
1. Login screen with phone entry
2. Role selection (both buttons)
3. OTP screen with dev mode banner
4. OTP input boxes filled
5. Home screen after login
6. Profile screen showing role
7. Language switch working

## 🎉 When All Tests Pass

You'll have a fully working authentication system with:
- ✅ Phone + OTP login
- ✅ Farmer/Retailer roles
- ✅ Session persistence
- ✅ Proper error handling
- ✅ Clean UI/UX

**Ready to test? Start with step 1! 🚀**
