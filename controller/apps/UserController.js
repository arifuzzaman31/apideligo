import bcrypt from 'bcrypt';
const prisma = require("../../lib/prisma.js");

async function createSimpleUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    try {
      return await prisma.users.create({
        data: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`.trim(),
            phoneNumber: userData.phoneNumber,
            password: hashedPassword,
            userType: userData.userType || 'DRIVER',
            isVerified: userData.isVerified || false,
            status: userData.status || false,
            serviceStatus: userData.serviceStatus !== undefined ? userData.serviceStatus : true,
            additionInfo: userData.additionInfo
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Email or phone number already exists');
      }
      throw error;
    }
}

async function storeUserAddress(params) {
    try {
        if (!params.userId) {
            throw new Error('User ID is required');
        }
        const address = await prisma.userAddress.create({
            data: {
                userId: params.userId,
                street: params.street || null,
                state: params.state || null,
                country: params.country || null,
                city: params.city || null,
                zip: params.zip || null,
                addressType: params.addressType || 'HOME',
                additionInfo: params.additionInfo || null,
                status: params.status ?? false
            },
            include: {
                user: true
            }
        });

        return address;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Address already exists for this user');
        } else if (error.code === 'P2003') {
            throw new Error('Invalid user ID - user does not exist');
        } else if (error.code === 'P2025') {
            throw new Error('User not found');
        }
        if (error.name === 'PrismaClientValidationError') {
            throw new Error('Invalid address data provided');
        }
        console.error('Error storing user address:', error);
        throw new Error('Failed to store user address');
    }
}

// Example usage:
// try {
//     const newAddress = await storeUserAddress({
//         userId: 1,
//         street: '123 Main Street',
//         city: 'New York',
//         state: 'NY',
//         zip: '10001',
//         country: 'USA',
//         addressType: 'HOME',
//         status: true
//     });
    
//     console.log('Address stored successfully:', newAddress);
// } catch (error) {
//     console.error('Error:', error.message);
// }

module.exports = {createSimpleUser,storeUserAddress}