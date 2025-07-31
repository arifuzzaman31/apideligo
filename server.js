// server.js or app.js
import { PrismaClient } from './generated/prisma/index.js';
import express from 'express';
import { Pool } from 'pg';
const prisma = new PrismaClient();
const app = express();
const port = 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/create-user', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    password,
    latitude,
    longitude,
  } = req.body;

  try {
    // Create the user
    const user = await prisma.users.create({
      data: {
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phoneNumber,
        password,
        // Set other fields if needed
      },
    });

    // Create the location
    const location = await prisma.userLocation.create({
      data: {
        userId: user.id,
        location: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    res.status(201).json({
      message: 'User and location created',
      user,
      location,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        userLoc: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/users/nearby', async (req, res) => {
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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
// SELECT id, ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326):: geography) AS distance FROM "UserLocation" WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326):: geography, $3) ORDER BY distance ASC;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Don't forget to disconnect Prisma Client when your app shuts down
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});