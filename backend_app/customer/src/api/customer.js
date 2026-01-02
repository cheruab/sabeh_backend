const CustomerService = require("../services/customer-service");
const UserAuth = require("./middlewares/auth");
const { SubscribeMessage } = require("../utils");
const FirebaseService = require("../services/firebase-service");
const OTPService = require("../services/otp-service");

module.exports = (app, channel) => {
  const service = new CustomerService();

  if (channel) {
    SubscribeMessage(channel, service);
  }
  // ===== NEW PHONE AUTH ENDPOINTS =====

  // Step 1: Send OTP for Signup
  app.post("/auth/signup/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Check if phone already exists
      const existing = await service.FindCustomerByPhone(phone);
      if (existing) {
        return res.status(400).json({ error: "Phone number already registered" });
      }

      // Check rate limiting
      const canSend = await OTPService.checkRateLimit(phone);
      if (!canSend) {
        return res.status(429).json({ 
          error: "Too many OTP requests. Please try again later" 
        });
      }

      // Generate and store OTP
      const otp = OTPService.generateOTP();
      await OTPService.storeOTP(phone, otp, "signup");

      // In production, Firebase will send SMS automatically
      // For development, return OTP (REMOVE IN PRODUCTION!)
      console.log(`OTP for ${phone}: ${otp}`);

      res.json({
        success: true,
        message: "OTP sent successfully",
        // Remove this in production:
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Step 2: Verify OTP and Firebase Token
  app.post("/auth/signup/verify-otp", async (req, res) => {
    try {
      const { phone, otp, firebaseToken } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: "Phone and OTP are required" });
      }

      // Verify OTP
      const otpResult = await OTPService.verifyOTP(phone, otp);
      if (!otpResult.success) {
        await OTPService.incrementAttempts(phone);
        return res.status(400).json({ error: otpResult.error });
      }

      // Optionally verify Firebase token if provided
      let firebaseUid = null;
      if (firebaseToken) {
        const firebaseResult = await FirebaseService.verifyIdToken(firebaseToken);
        if (firebaseResult.success) {
          firebaseUid = firebaseResult.uid;
        }
      }

      res.json({
        success: true,
        message: "OTP verified. Complete your profile.",
        firebaseUid,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Step 3: Complete Signup (Create Account) - UPDATED to include lastName
  app.post("/auth/signup/complete", async (req, res) => {
    try {
      const { phone, password, name, lastName, email, firebaseUid } = req.body;

      if (!phone || !password || !name || !lastName) {
        return res.status(400).json({ 
          error: "Phone, password, first name, and last name are required" 
        });
      }

      // Create account
      const { data } = await service.SignUpWithPhone({
        phone,
        password,
        name,
        lastName,
        email,
        firebaseUid,
      });

      res.json(data);
    } catch (error) {
      console.error("Complete signup error:", error);
      res.status(500).json({ error: error.message || "Failed to create account" });
    }
  });

  // Phone + Password Login
  app.post("/auth/login/phone", async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: "Phone and password are required" });
      }

      const { data } = await service.SignInWithPhone({ phone, password });
      res.json(data);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // OTP Login - Step 1: Send OTP
  app.post("/auth/login/otp/send", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Check if user exists
      const existing = await service.FindCustomerByPhone(phone);
      if (!existing) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Check rate limiting
      const canSend = await OTPService.checkRateLimit(phone);
      if (!canSend) {
        return res.status(429).json({ 
          error: "Too many OTP requests. Please try again later" 
        });
      }

      // Generate and store OTP
      const otp = OTPService.generateOTP();
      await OTPService.storeOTP(phone, otp, "login");

      console.log(`Login OTP for ${phone}: ${otp}`);

      res.json({
        success: true,
        message: "OTP sent successfully",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } catch (error) {
      console.error("Send login OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // OTP Login - Step 2: Verify OTP and Login
  app.post("/auth/login/otp/verify", async (req, res) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: "Phone and OTP are required" });
      }

      // Verify OTP
      const otpResult = await OTPService.verifyOTP(phone, otp);
      if (!otpResult.success) {
        await OTPService.incrementAttempts(phone);
        return res.status(400).json({ error: otpResult.error });
      }

      // Login user
      const { data } = await service.LoginWithOTP(phone);
      res.json(data);
    } catch (error) {
      console.error("OTP login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ===== EXISTING ENDPOINTS (Keep for backward compatibility) =====

  app.post("/signup", async (req, res, next) => {
    const { email, password, phone } = req.body;
    const { data } = await service.SignUp({ email, password, phone });
    res.json(data);
  });

  app.get("/getAll", async (req, res, next) => {
    try {
      const { data } = await service.getUsers();
      res.json(data);
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    const { data } = await service.SignIn({ email, password });
    res.json(data);
  });

  app.post("/address", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { type, completeAddress, latitude, longitude } = req.body;
    console.log(latitude);
    const { data } = await service.AddNewAddress(_id, {
      type,
      completeAddress,
      latitude,
      longitude,
    });
    res.json(data);
  });

  app.get("/addresses", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.getAddresses(_id);
    res.json(data);
  });

  app.get("/profile", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetProfile({ _id });
    res.json(data);
  });

  app.get("/shoping-details", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetShopingDetails(_id);
    return res.json(data);
  });

  app.get("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetWishList(_id);
    return res.status(200).json(data);
  });

  app.get("/whoami", (req, res, next) => {
    return res.status(200).json({ msg: "/customer : I am Customer Service" });
  });
};