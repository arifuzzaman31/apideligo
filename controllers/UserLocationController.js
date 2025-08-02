// controllers/UserLocationController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// Create or update user location
export const createOrUpdateUserLocation = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { longitude, latitude } = req.body;

    // Validate coordinates
    if (typeof longitude !== "number" || typeof latitude !== "number") {
      return res
        .status(400)
        .json({ error: "Valid longitude and latitude are required" });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Upsert user location (create if not exists, update if exists)
    const userLocation = await prisma.userLocation.upsert({
      where: { userId },
      update: {
        location: [longitude, latitude],
      },
      create: {
        userId,
        location: [longitude, latitude],
      },
    });

    res.status(200).json({
      message: "User location saved successfully",
      userLocation: {
        id: userLocation.id,
        userId: userLocation.userId,
        location: {
          longitude: userLocation.location[0],
          latitude: userLocation.location[1],
        },
        createdAt: userLocation.createdAt,
        updatedAt: userLocation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving user location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user's location
export const getUserLocation = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const userLocation = await prisma.userLocation.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true,
          },
        },
      },
    });

    if (!userLocation) {
      return res.status(404).json({ error: "User location not found" });
    }

    res.status(200).json({
      userLocation: {
        id: userLocation.id,
        userId: userLocation.userId,
        user: userLocation.user,
        location: {
          longitude: userLocation.location[0],
          latitude: userLocation.location[1],
        },
        createdAt: userLocation.createdAt,
        updatedAt: userLocation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting user location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user location
export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { longitude, latitude } = req.body;

    // Validate coordinates
    if (typeof longitude !== "number" || typeof latitude !== "number") {
      return res
        .status(400)
        .json({ error: "Valid longitude and latitude are required" });
    }

    // Check if user location exists
    const existingLocation = await prisma.userLocation.findUnique({
      where: { userId },
    });

    if (!existingLocation) {
      return res.status(404).json({ error: "User location not found" });
    }

    // Update user location
    const updatedLocation = await prisma.userLocation.update({
      where: { userId },
      data: {
        location: [longitude, latitude],
      },
    });

    res.status(200).json({
      message: "User location updated successfully",
      userLocation: {
        id: updatedLocation.id,
        userId: updatedLocation.userId,
        location: {
          longitude: updatedLocation.location[0],
          latitude: updatedLocation.location[1],
        },
        createdAt: updatedLocation.createdAt,
        updatedAt: updatedLocation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete user location
export const deleteUserLocation = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    // Check if user location exists
    const existingLocation = await prisma.userLocation.findUnique({
      where: { userId },
    });

    if (!existingLocation) {
      return res.status(404).json({ error: "User location not found" });
    }

    // Delete user location
    await prisma.userLocation.delete({
      where: { userId },
    });

    res.status(200).json({ message: "User location deleted successfully" });
  } catch (error) {
    console.error("Error deleting user location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all user locations (admin only)
export const getAllUserLocations = async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await prisma.users.findUnique({
      where: { id: req.user.userId },
      select: { userType: true },
    });

    // if (currentUser.userType !== 'ADMIN') {
    //   return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    // }

    const userLocations = await prisma.userLocation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true,
            userType: true,
          },
        },
      },
    });

    // Format the response to separate longitude and latitude
    const formattedLocations = userLocations.map((location) => ({
      id: location.id,
      userId: location.userId,
      user: location.user,
      location: {
        longitude: location.location[0],
        latitude: location.location[1],
      },
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    }));

    res.status(200).json({ userLocations: formattedLocations });
  } catch (error) {
    console.error("Error getting all user locations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Find users within a certain radius (admin only)
export const findUsersWithinRadius = async (req, res) => {
  try {
    const currentUser = await prisma.users.findUnique({
      where: { id: req.user.userId },
      select: { userType: true },
    });

    const { longitude, latitude, radius } = req.body;

    // Validate parameters
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      typeof radius !== "number"
    ) {
      return res
        .status(400)
        .json({ error: "Valid longitude, latitude, and radius are required" });
    }

    // Using raw SQL for spatial query with PostGIS
    const usersWithinRadius = await prisma.$queryRaw`
      SELECT 
        ul.id,
        ul."userId",
        ul.location,
        u."fullName",
        u."phoneNumber",
        ST_Distance(
          ST_MakePoint(ul.location[1], ul.location[2])::geography, 
          ST_SetSRID(ST_MakePoint(${parseFloat(longitude)}, ${parseFloat(
      latitude
    )}), 4326)::geography
        ) AS distance 
      FROM "UserLocation" ul
      JOIN "Users" u ON ul."userId" = u.id
      WHERE ST_DWithin(
          ST_MakePoint(ul.location[1], ul.location[2])::geography, 
          ST_SetSRID(ST_MakePoint(${parseFloat(longitude)}, ${parseFloat(
      latitude
    )}), 4326)::geography, 
          ${parseFloat(radius)}
        ) 
        AND u."serviceStatus" = true
    AND u."status" = true
    AND u."isVerified" = true
    AND u."deletedAt" IS NULL
    AND u."userType" = 'DRIVER'
      ORDER BY distance ASC
      LIMIT 50
    `;

    res.status(200).json({ result: "success", usersWithinRadius });
  } catch (error) {
    console.error("Error finding users within radius:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
