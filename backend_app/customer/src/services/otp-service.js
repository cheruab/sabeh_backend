const OTPModel = require("../database/models/OTP");

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in database
  async storeOTP(phone, otp, type = "signup") {
    try {
      // Delete any existing OTPs for this phone
      await OTPModel.deleteMany({ phone });

      // Create new OTP with 5-minute expiry
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const otpDoc = new OTPModel({
        phone,
        otp,
        type,
        expiresAt,
      });

      await otpDoc.save();
      return { success: true, otp };
    } catch (error) {
      console.error("Error storing OTP:", error);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP
  async verifyOTP(phone, otp) {
    try {
      const otpDoc = await OTPModel.findOne({
        phone,
        otp,
        verified: false,
      }).sort({ createdAt: -1 });

      if (!otpDoc) {
        return { success: false, error: "Invalid OTP" };
      }

      // Check if OTP expired
      if (new Date() > otpDoc.expiresAt) {
        return { success: false, error: "OTP expired" };
      }

      // Check attempts
      if (otpDoc.attempts >= 3) {
        return { success: false, error: "Too many attempts. Request new OTP" };
      }

      // Mark as verified
      otpDoc.verified = true;
      await otpDoc.save();

      return { success: true, type: otpDoc.type };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, error: error.message };
    }
  }

  // Increment failed attempts
  async incrementAttempts(phone) {
    try {
      await OTPModel.updateOne(
        { phone, verified: false },
        { $inc: { attempts: 1 } }
      );
    } catch (error) {
      console.error("Error incrementing attempts:", error);
    }
  }

  // Check rate limiting (max 3 OTPs per hour)
  async checkRateLimit(phone) {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const count = await OTPModel.countDocuments({
        phone,
        createdAt: { $gte: oneHourAgo },
      });

      return count < 3;
    } catch (error) {
      return true; // Allow on error
    }
  }
}

module.exports = new OTPService();