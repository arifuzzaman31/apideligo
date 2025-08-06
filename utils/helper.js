import jwt from "jsonwebtoken";
import crypto from 'crypto';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
  };
  // Helper: Generate 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
}

export {
    generateToken,
    generateOTP
  };