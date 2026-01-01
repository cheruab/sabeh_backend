const admin = require("firebase-admin");

// For development without Firebase, use a mock service
let firebaseInitialized = false;

try {
  const serviceAccount = require("../config/firebase-admin-key.json");
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  firebaseInitialized = true;
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.warn("⚠️ Firebase Admin not initialized - running without Firebase:", error.message);
  console.warn("   Phone auth will work with OTP only (no Firebase verification)");
}

class FirebaseService {
  // Verify Firebase ID token
  async verifyIdToken(idToken) {
    if (!firebaseInitialized) {
      return {
        success: false,
        error: "Firebase not initialized",
      };
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        success: true,
        uid: decodedToken.uid,
        phone: decodedToken.phone_number,
      };
    } catch (error) {
      console.error("Error verifying token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user by phone number
  async getUserByPhone(phoneNumber) {
    if (!firebaseInitialized) {
      return {
        success: false,
        error: "Firebase not initialized",
      };
    }

    try {
      const user = await admin.auth().getUserByPhoneNumber(phoneNumber);
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create custom token for a user
  async createCustomToken(uid) {
    if (!firebaseInitialized) {
      return {
        success: false,
        error: "Firebase not initialized",
      };
    }

    try {
      const customToken = await admin.auth().createCustomToken(uid);
      return {
        success: true,
        token: customToken,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete user
  async deleteUser(uid) {
    if (!firebaseInitialized) {
      return {
        success: false,
        error: "Firebase not initialized",
      };
    }

    try {
      await admin.auth().deleteUser(uid);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new FirebaseService();