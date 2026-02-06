-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50) NOT NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  amount DECIMAL(10,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, month, year)
);

-- Insert default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Food & Dining', '#FF6B6B', '🍽️'),
  ('Transportation', '#4ECDC4', '🚗'),
  ('Shopping', '#45B7D1', '🛍️'),
  ('Entertainment', '#96CEB4', '🎬'),
  ('Bills & Utilities', '#FFEAA7', '💡'),
  ('Healthcare', '#DDA0DD', '🏥'),
  ('Education', '#98D8C8', '📚'),
  ('Travel', '#F7DC6F', '✈️'),
  ('Other', '#BDC3C7', '📦')
ON CONFLICT DO NOTHING;