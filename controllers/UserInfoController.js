// controllers/UserInfoController.js
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Create user info
export const createOrUpdateUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const {
      birthDate,
      picture,
      residenceAddress,
      occupation,
      designation,
      nid,
      refferalId,
      tin,
      additionInfo
    } = req.body;

    // Check if user info already exists
    const existingUserInfo = await prisma.userInfos.findUnique({
      where: { userId }
    });

    if (existingUserInfo) {
      // Update existing user info
      const updateData = await prisma.userInfos.update({
        where: { userId },
        data: {
          birthDate: birthDate ? new Date(birthDate) : null,
          picture,
          residenceAddress,
          occupation,
          designation,
          nid,
          refferalId,
          tin,
          additionInfo
        }
      });
      return res.status(200).json({ 
        message: 'User info updated successfully',
        userInfo: updateData 
      });
    }

    // Create new user info
    const userInfo = await prisma.userInfos.create({
      data: {
        userId,
        birthDate: birthDate ? new Date(birthDate) : null,
        picture,
        residenceAddress,
        occupation,
        designation,
        nid,
        refferalId,
        tin,
        additionInfo
      }
    });

    res.status(201).json({
      message: 'User info created successfully',
      userInfo
    });
  } catch (error) {
    console.error('Error creating/updating user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user info
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const userInfo = await prisma.userInfos.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true
          }
        }
      }
    });

    if (!userInfo) {
      return res.status(404).json({ error: 'User info not found' });
    }

    res.status(200).json({ userInfo });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user info
export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const {
      birthDate,
      picture,
      residenceAddress,
      occupation,
      designation,
      nid,
      refferalId,
      tin,
      additionInfo,
      status
    } = req.body;

    // Check if user info exists
    const existingUserInfo = await prisma.userInfos.findUnique({
      where: { userId }
    });

    if (!existingUserInfo) {
      return res.status(404).json({ error: 'User info not found' });
    }

    // Update user info
    const updatedUserInfo = await prisma.userInfos.update({
      where: { userId },
      data: {
        birthDate: birthDate ? new Date(birthDate) : undefined,
        picture,
        residenceAddress,
        occupation,
        designation,
        nid,
        refferalId,
        tin,
        additionInfo,
        status
      }
    });

    res.status(200).json({
      message: 'User info updated successfully',
      userInfo: updatedUserInfo
    });
  } catch (error) {
    console.error('Error updating user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Soft delete user info
export const deleteUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    // Check if user info exists
    const existingUserInfo = await prisma.userInfos.findUnique({
      where: { userId }
    });

    if (!existingUserInfo) {
      return res.status(404).json({ error: 'User info not found' });
    }

    // Soft delete by setting deletedAt
    await prisma.userInfos.update({
      where: { userId },
      data: {
        deletedAt: new Date()
      }
    });

    res.status(200).json({ message: 'User info deleted successfully' });
  } catch (error) {
    console.error('Error deleting user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOrUpdateUserAddress = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const {
      street,
      state,
      country,
      city,
      zip,
      addressType = 'HOME',
      additionInfo
    } = req.body;

    // Check if user address already exists for this user and address type
    const existingUserAddress = await prisma.userAddress.findFirst({
      where: { 
        userId,
        addressType
      }
    });

    if (existingUserAddress) {
      // Update existing user address
      const updateData = await prisma.userAddress.update({
        where: { id: existingUserAddress.id },
        data: {
          street,
          state,
          country,
          city,
          zip,
          addressType,
          additionInfo
        }
      });
      return res.status(200).json({ 
        message: 'User address updated successfully',
        userAddress: updateData 
      });
    }

    // Create new user address
    const userAddress = await prisma.userAddress.create({
      data: {
        userId,
        street,
        state,
        country,
        city,
        zip,
        addressType,
        additionInfo
      }
    });

    res.status(201).json({
      message: 'User address created successfully',
      userAddress
    });
  } catch (error) {
    console.error('Error creating/updating user address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all user info (admin only)
export const getAllUserInfo = async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await prisma.users.findUnique({
      where: { id: req.user.userId },
      select: { userType: true }
    });

    if (currentUser.userType !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const userInfoList = await prisma.userInfos.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true,
            userType: true
          }
        }
      }
    });

    res.status(200).json({ userInfoList });
  } catch (error) {
    console.error('Error getting all user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};