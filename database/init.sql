-- Create database (run this first as superuser)
-- CREATE DATABASE kanbanflow;

-- Connect to kanbanflow database and run the following:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards table
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    background_color VARCHAR(7) DEFAULT '#0079bf',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Board members table (for collaboration)
CREATE TABLE board_members (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(board_id, user_id)
);

-- Lists table (columns in Kanban)
CREATE TABLE lists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    due_date TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Card members table (assigned users)
CREATE TABLE card_members (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_id, user_id)
);

-- Labels table
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Card labels table (many-to-many)
CREATE TABLE card_labels (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE(card_id, label_id)
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities/History table (for tracking changes)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_card_members_card_id ON card_members(card_id);
CREATE INDEX idx_card_members_user_id ON card_members(user_id);
CREATE INDEX idx_comments_card_id ON comments(card_id);
CREATE INDEX idx_activities_board_id ON activities(board_id);
CREATE INDEX idx_activities_card_id ON activities(card_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@kanbanflow.com', '$2a$10$XMKk7lOPmOOOhOOOhOOOhO3fMj7QjLJ7x9z3kZ8yL9qV2mN5qZ8yL', 'admin');

-- Insert sample data
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', '$2a$10$XMKk7lOPmOOOhOOOhOOOhO3fMj7QjLJ7x9z3kZ8yL9qV2mN5qZ8yL', 'user'),
('Jane Smith', 'jane@example.com', '$2a$10$XMKk7lOPmOOOhOOOhOOOhO3fMj7QjLJ7x9z3kZ8yL9qV2mN5qZ8yL', 'user');