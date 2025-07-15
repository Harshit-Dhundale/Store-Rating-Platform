-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'OWNER');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(60) NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);

-- Create materialized view for store averages
CREATE MATERIALIZED VIEW store_avg_ratings AS
SELECT 
    s.id as store_id,
    s.name as store_name,
    COALESCE(AVG(r.value), 0) as avg_rating,
    COUNT(r.id) as rating_count
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX ON store_avg_ratings (store_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_store_averages()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY store_avg_ratings;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to refresh materialized view
CREATE TRIGGER refresh_averages_on_rating_change
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_store_averages();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     (SELECT role FROM users WHERE id::text = auth.uid()::text) = 'ADMIN');

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Stores are readable by all authenticated users
CREATE POLICY "Stores are viewable by authenticated users" ON stores
    FOR SELECT TO authenticated USING (true);

-- Only admins can manage stores
CREATE POLICY "Only admins can manage stores" ON stores
    FOR ALL USING ((SELECT role FROM users WHERE id::text = auth.uid()::text) = 'ADMIN');

-- Ratings policies
CREATE POLICY "Users can view all ratings" ON ratings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own ratings" ON ratings
    FOR ALL USING (auth.uid()::text = user_id::text);
