-- Create database
CREATE DATABASE "deligodb";

-- Connect to the new database
\c "deligodb";

-- Create PostGIS extension for geography support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enums first
CREATE TYPE "locationType" AS ENUM ('HOME', 'WORK', 'OTHER');
CREATE TYPE "loggerType" AS ENUM ('DASHBOARD_USER', 'APPS_USER');
CREATE TYPE "UserType" AS ENUM ('DRIVER', 'RIDER');

-- Create Users table
CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    fullName VARCHAR(255),
    identityCode VARCHAR(255),
    userType "UserType" DEFAULT 'DRIVER',
    phoneNumber VARCHAR(50),
    password VARCHAR(255),
    isVerified BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    serviceStatus BOOLEAN DEFAULT TRUE,
    additionInfo TEXT,
    deletedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedBy INTEGER DEFAULT 0
);

-- Create Session table
CREATE TABLE "Session" (
    id SERIAL PRIMARY KEY,
    sessionToken VARCHAR(255) UNIQUE NOT NULL,
    userId INTEGER,
    expireAt TIMESTAMP WITH TIME ZONE NOT NULL,
    loggerType "loggerType",
    
    -- Foreign key constraint
    CONSTRAINT fk_session_user 
        FOREIGN KEY(userId) 
        REFERENCES "Users"(id) 
        ON DELETE SET NULL
);

-- Create UserAddress table
CREATE TABLE "UserAddress" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    street VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    city VARCHAR(255),
    zip VARCHAR(20),
    addressType "locationType" DEFAULT 'HOME',
    additionInfo TEXT,
    status BOOLEAN DEFAULT FALSE,
    deletedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedBy INTEGER DEFAULT 0,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_address_user 
        FOREIGN KEY(userId) 
        REFERENCES "Users"(id) 
        ON DELETE CASCADE
);

-- Create UserInfos table
CREATE TABLE "UserInfos" (
    id SERIAL PRIMARY KEY,
    userId INTEGER UNIQUE,
    birthDate TIMESTAMP WITH TIME ZONE,
    picture VARCHAR(255),
    residenceAddress TEXT,
    occupation VARCHAR(255),
    designation VARCHAR(255),
    nid INTEGER,
    refferalId VARCHAR(255),
    tin VARCHAR(255),
    status BOOLEAN DEFAULT FALSE,
    additionInfo TEXT,
    deletedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedBy INTEGER DEFAULT 0,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_info_user 
        FOREIGN KEY(userId) 
        REFERENCES "Users"(id) 
        ON DELETE CASCADE
);

-- Create Otp table
CREATE TABLE "Otp" (
    id SERIAL PRIMARY KEY,
    userId INTEGER,
    phoneNumber VARCHAR(50),
    isVerify BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    otpExpireAt TIMESTAMP WITH TIME ZONE,
    deletedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedBy INTEGER DEFAULT 0,
    
    -- Foreign key constraint
    CONSTRAINT fk_otp_user 
        FOREIGN KEY(userId) 
        REFERENCES "Users"(id) 
        ON DELETE SET NULL
);

-- Create UserLocation table with GEOGRAPHY type
CREATE TABLE "UserLocation" (
    id SERIAL PRIMARY KEY,
    userId INTEGER UNIQUE,
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- Using geography type for spatial data
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_location_user 
        FOREIGN KEY(userId) 
        REFERENCES "Users"(id) 
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_users_name_email_phone ON "Users" (fullName, email, phoneNumber);
CREATE INDEX idx_user_address_user_id ON "UserAddress" (userId);
CREATE INDEX idx_user_info_user_nid ON "UserInfos" (userId, nid);
CREATE INDEX idx_otp_user_phone ON "Otp" (userId, phoneNumber);
CREATE INDEX idx_user_location_user_id ON "UserLocation" (userId);

-- Create spatial index for location queries using geography type
CREATE INDEX idx_user_location_spatial ON "UserLocation" USING GIST (location);

-- Create trigger function for updating updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "Users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at
    BEFORE UPDATE ON "Session"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_address_updated_at
    BEFORE UPDATE ON "UserAddress"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_info_updated_at
    BEFORE UPDATE ON "UserInfos"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_otp_updated_at
    BEFORE UPDATE ON "Otp"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_location_updated_at
    BEFORE UPDATE ON "UserLocation"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();