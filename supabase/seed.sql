-- Seed data for testing

-- Insert test users into auth.users
-- Note: These will trigger the user profile creation automatically via the trigger

-- User 1: Admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin","display_name":"Admin User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- User 2: Regular user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'authenticated',
  'authenticated',
  'john@test.com',
  crypt('john123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"john","display_name":"John Doe"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- User 3: Another regular user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'authenticated',
  'authenticated',
  'jane@test.com',
  crypt('jane123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"jane","display_name":"Jane Smith"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Update the admin user to have Admin role in users table
UPDATE users SET role = 'Admin' WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Add some sample fines for testing
INSERT INTO fines (
  subject_id,
  proposer_id,
  subject_name,
  proposer_name,
  fine_type,
  amount,
  description,
  created_at
) VALUES 
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'John Doe',
  'Admin User',
  'fine',
  25.00,
  'Late to morning standup meeting',
  NOW() - INTERVAL '2 days'
),
(
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Jane Smith',
  'Admin User',
  'warning',
  0.00,
  'Forgot to update Jira ticket status',
  NOW() - INTERVAL '1 day'
),
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'John Doe',
  'Jane Smith',
  'credit',
  15.00,
  'Helped fix critical bug on weekend',
  NOW() - INTERVAL '3 hours'
);