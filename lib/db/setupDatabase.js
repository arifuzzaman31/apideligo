// setupDatabase.js
const { Client } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

// Database name
const dbName = process.env.DB_NAME || 'location_db';

async function setupDatabase() {
  const client = new Client({
    ...dbConfig,
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    // Connect to PostgreSQL
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Create database if it doesn't exist
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }

    // Close connection to postgres database
    await client.end();

    // Connect to the newly created database
    const dbClient = new Client({
      ...dbConfig,
      database: dbName,
    });
    await dbClient.connect();
    console.log(`Connected to "${dbName}" database`);

    // Create Users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20) NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created successfully');

    // Create UserLocation table with spatial support
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS "UserLocation" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('UserLocation table created successfully');

    // Create spatial index for location queries
    await dbClient.query(`
      CREATE INDEX IF NOT EXISTS idx_userlocation_location 
      ON "UserLocation" USING GIST (location);
    `);
    console.log('Spatial index created successfully');

    // Close connection
    await dbClient.end();
    console.log('Database setup completed successfully');
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();