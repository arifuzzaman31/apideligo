// controllers/UserController.js
import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
const prisma = new PrismaClient();
// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Helper function to hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Helper function to verify password
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Create a new user
export const createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, phoneNumber, password, userType = 'DRIVER' } = req.body;

        // Check if user already exists
        const existingUser = await prisma.Users.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
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
                identity: uuidv4()
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await prisma.users.findUnique({
        where: { email }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate session token
      const sessionToken = uuidv4();
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + 365); // Token expires in 1  year
      
      // Delete any existing sessions for this user
      await prisma.session.deleteMany({
        where: { userId: user.id }
      });
      
      // Create new session
      const session = await prisma.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expireAt,
          loggerType: 'APPS_USER'
        }
      });
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
        sessionToken
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Register user
  export const registerUser = async (req, res) => {
    try {
      const { email, firstName, lastName, phoneNumber, password, userType = 'DRIVER' } = req.body;
      
      // Check if user already exists
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await prisma.users.create({
        data: {
          email,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          phoneNumber,
          password: hashedPassword,
          userType
        }
      });
      
      // Generate session token
      const sessionToken = uuidv4();
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + 365); // Token expires in 1 year
      
      // Create session
      const session = await prisma.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expireAt,
          loggerType: 'APPS_USER'
        }
      });
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token,
        sessionToken
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Logout user
export const logoutUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming user is attached to request from auth middleware

        // Delete session
        await prisma.Session.deleteMany({
            where: { userId }
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ error: 'Internal server error' });
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
                UserLocation: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const nearByMe = async (req, res) => {
    const { lat, lng, distance } = req.query;
    try {
        const result = await prisma.$queryRaw`
      SELECT 
        ul.id,
        ul."userId",
        ul.location,
        u."fullName",
        u."phoneNumber",
        ST_Distance(
          ST_MakePoint(ul.location[1], ul.location[2])::geography, 
          ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography
        ) AS distance 
      FROM "UserLocation" ul
      JOIN "Users" u ON ul."userId" = u.id
      WHERE ST_DWithin(
          ST_MakePoint(ul.location[1], ul.location[2])::geography, 
          ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography, 
          ${parseFloat(distance)}
        ) 
      ORDER BY distance ASC
    `;
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err });
    }
}