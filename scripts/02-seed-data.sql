-- Insert admin user
INSERT INTO users (id, name, email, address, password_hash, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'System Administrator User', 'admin@storerating.com', '123 Admin Street, Admin City, AC 12345', '$2b$12$LQv3c1yqBwEHXw.9oC9.Oe4.0rHY.Jb9.0rHY.Jb9.0rHY.Jb9.0r', 'ADMIN');

-- Insert sample stores
INSERT INTO stores (id, name, email, address, owner_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Downtown Coffee Shop', 'info@downtowncoffee.com', '456 Main Street, Downtown, DT 67890', NULL),
('660e8400-e29b-41d4-a716-446655440002', 'Riverside Restaurant', 'contact@riverside.com', '789 River Road, Riverside, RS 54321', NULL),
('660e8400-e29b-41d4-a716-446655440003', 'Tech Store Electronics', 'support@techstore.com', '321 Tech Avenue, Silicon Valley, SV 98765', NULL);

-- Insert sample users
INSERT INTO users (id, name, email, address, password_hash, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Regular User Customer One', 'user1@example.com', '111 User Lane, User City, UC 11111', '$2b$12$LQv3c1yqBwEHXw.9oC9.Oe4.0rHY.Jb9.0rHY.Jb9.0rHY.Jb9.0r', 'USER'),
('550e8400-e29b-41d4-a716-446655440002', 'Store Owner Business Person', 'owner@example.com', '222 Owner Boulevard, Owner Town, OT 22222', '$2b$12$LQv3c1yqBwEHXw.9oC9.Oe4.0rHY.Jb9.0rHY.Jb9.0rHY.Jb9.0r', 'OWNER');

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, value) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 5),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 4),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 4),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 3);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW store_avg_ratings;
