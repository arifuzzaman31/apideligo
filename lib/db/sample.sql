-- Create database
CREATE DATABASE "deligodb";
-- Connect to the new database
\c "deligodb";

-- Create PostGIS extension for geography support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enums first
CREATE TYPE "location_type" AS ENUM ('HOME', 'WORK', 'OTHER');
CREATE TYPE "logger_type" AS ENUM ('DASHBOARD_USER', 'APPS_USER');
CREATE TYPE "user_type" AS ENUM ('DRIVER', 'RIDER');

-- Create Users table
CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(255),
    identity_code VARCHAR(255),
    user_type "user_type" DEFAULT 'DRIVER',
    phone_number VARCHAR(50),
    password VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    service_status BOOLEAN DEFAULT TRUE,
    addition_info TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER DEFAULT 0
);

-- Create Session table
CREATE TABLE "session" (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER,
    expire_at TIMESTAMP WITH TIME ZONE NOT NULL,
    logger_type "logger_type",
    
    -- Foreign key constraint
    CONSTRAINT fk_session_user 
        FOREIGN KEY(user_id) 
        REFERENCES "users"(id) 
        ON DELETE SET NULL
);

-- Create UserAddress table
CREATE TABLE "user_address" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    street VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    city VARCHAR(255),
    zip VARCHAR(20),
    address_type "location_type" DEFAULT 'HOME',
    addition_info TEXT,
    status BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER DEFAULT 0,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_address_user 
        FOREIGN KEY(user_id) 
        REFERENCES "users"(id) 
        ON DELETE CASCADE
);

-- Create UserInfos table
CREATE TABLE "user_infos" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    birth_date TIMESTAMP WITH TIME ZONE,
    picture VARCHAR(255),
    residence_address TEXT,
    occupation VARCHAR(255),
    designation VARCHAR(255),
    nid INTEGER,
    refferal_id VARCHAR(255),
    tin VARCHAR(255),
    status BOOLEAN DEFAULT FALSE,
    addition_info TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER DEFAULT 0,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_info_user 
        FOREIGN KEY(user_id) 
        REFERENCES "users"(id) 
        ON DELETE CASCADE
);

-- Create Otp table
CREATE TABLE "otp" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    phone_number VARCHAR(50),
    is_verify BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    otp_expire_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER DEFAULT 0,
    
    -- Foreign key constraint
    CONSTRAINT fk_otp_user 
        FOREIGN KEY(user_id) 
        REFERENCES "users"(id) 
        ON DELETE SET NULL
);

-- Create UserLocation table with GEOGRAPHY type
CREATE TABLE "user_location" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- Using geography type for spatial data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_location_user 
        FOREIGN KEY(user_id) 
        REFERENCES "users"(id) 
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_users_full_name_email_phone ON "users" (full_name, email, phone_number);
CREATE INDEX idx_user_address_user_id ON "user_address" (user_id);
CREATE INDEX idx_user_info_user_nid ON "user_infos" (user_id, nid);
CREATE INDEX idx_otp_user_phone ON "otp" (user_id, phone_number);
CREATE INDEX idx_user_location_user_id ON "user_location" (user_id);

-- Create spatial index for location queries using geography type
CREATE INDEX idx_user_location_spatial ON "user_location" USING GIST (location);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at
    BEFORE UPDATE ON "session"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_address_updated_at
    BEFORE UPDATE ON "user_address"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_info_updated_at
    BEFORE UPDATE ON "user_infos"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_otp_updated_at
    BEFORE UPDATE ON "otp"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_location_updated_at
    BEFORE UPDATE ON "user_location"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();