// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await prisma.Users.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if session exists and is valid
    const session = await prisma.Session.findFirst({
      where: {
        userId: decoded.userId,
        expireAt: {
          gt: new Date()
        }
      }
    });
    
    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
    
    // Attach user to request
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};