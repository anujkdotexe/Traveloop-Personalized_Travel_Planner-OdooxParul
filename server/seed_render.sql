CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(10) NOT NULL DEFAULT 'user',
  language_preference VARCHAR(20) DEFAULT 'English'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END$$;

INSERT INTO users (name, email, password_hash, role, profile_image_url)
VALUES
  ('Demo User', 'demouser@traveloop.com', '$2b$12$Q.s9jTC7bpaQfuEUtHx0y.nmTmAsmrG931lXeFfwzRV5ZA88wJulK', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo%20User')
ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash, role=EXCLUDED.role;

INSERT INTO users (name, email, password_hash, role, profile_image_url)
VALUES
  ('Admin', 'admin@traveloop.com', '$2b$12$Q4dDJf7KhvPSfDtn6wvHFetQ.Qce21biZo/VGw4KAx94M7QWF0Vu6', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash, role=EXCLUDED.role;

