// controllers/UserController.js
import { v4 as uuidv4 } from "uuid";
import prisma from '../lib/prisma.js';
import { hashPassword, verifyPassword } from "../utils/passwordUtils.js";
import { generateToken, generateOTP } from "../utils/helper.js";
// Create a new user
export const createUser = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      password,
      userType = "DRIVER",
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.Users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.Users.create({
      data: {
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phoneNumber,
        password: hashedPassword,
        userType,
        identity: uuidv4(),
        serviceStatus: true,
        status: true,
        isVerified: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate session token
    const sessionToken = uuidv4();
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 365); // Token expires in 1  year

    // Delete any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Create new session
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expireAt,
        loggerType: "APPS_USER",
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
      sessionToken,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register user
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, gender } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists
      const existingUser = await tx.users.findFirst({
        where: {
          OR: [{ email }, { phoneNumber }],
        },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create user
      const user = await tx.users.create({
        data: {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          phoneNumber,
          isVerified: false,
          status: false,
        },
      });

      // Generate and store OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

      await tx.otp.create({
        data: {
          userId: user.id,
          phoneNumber,
          otpNo:otp,
          otpExpireAt: otpExpiry,
          status: true,
        },
      });
      // Create user info record
      await tx.userInfos.create({
        data: {
          userId: user.id,
          gender: gender,
          status: false,
        },
      });
      return { user, otp };
    });
    res.status(201).json({
      info: `OTP for ${phoneNumber}: ${result.otp}`,
      message: "Registration initiated. OTP sent to your phone",
      userId: result.user.id,
    });
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const otpVerify = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // Find valid OTP record
      const otpRecord = await tx.otp.findFirst({
        where: {
          phoneNumber,
          otpNo:otp,
          status: true,
          otpExpireAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      // Update user verification status
      await tx.users.update({
        where: { id: otpRecord.userId },
        data: { isVerified: true },
      });

      // Mark OTP as used
      await tx.otp.update({
        where: { id: otpRecord.id },
        data: { isVerify: true, status: false },
      });
    });
    res.json({ message: "Phone verified successfully" });
  } catch (error) {
    if (error.message === 'Invalid or expired OTP') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Set user password
export const setPassword = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // Find verified user
      const user = await tx.users.findFirst({
        where: {
          phoneNumber,
          isVerified: true,
        },
      });

      if (!user) {
        return res.status(400).json({ error: "User not verified" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Update user with password
      await tx.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          status: true,
          serviceStatus: true,
        },
      });
      await tx.userInfos.update({
        where: { userId: user.id },
        data: {
          userId: user.id,
          birthDate: new Date(),
          approveTerms: true,
          approvePrivacy: true,
          status: true,
        },
      });
    });
    res.json({ message: "Registration completed successfully" });
  } catch (error) {
    if (error.message === 'User not verified') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
// Logout user
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming user is attached to request from auth middleware

    // Delete session
    await prisma.Session.deleteMany({
      where: { userId },
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming user is attached to request from auth middleware

    // Get user with related data
    const user = await prisma.Users.findUnique({
      where: { id: userId },
      include: {
        UserInfos: true,
        UserAddress: true,
        UserLocation: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const nearByMe = async (req, res) => {
  const { lat, lng, distance } = req.query;
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        ul.id,
        ul."user_id",
        ul.location,
        u."full_name",
        u."phone_number",
        ST_Distance(
          ST_MakePoint(ul.location[1], ul.location[2])::geography, 
          ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(
      lat
    )}), 4326)::geography
        ) AS distance 
      FROM "user_location" ul
      JOIN "users" u ON ul."user_id" = u.id
      WHERE ST_DWithin(
          ST_MakePoint(ul.location[1], ul.location[2])::geography, 
          ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(
      lat
    )}), 4326)::geography, 
          ${parseFloat(distance)}
        ) 
      ORDER BY distance ASC
    `;
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
