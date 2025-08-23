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
  'sam@test.com',
  crypt('1234', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"samfeldman","display_name":"Sam Feldman"}',
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
  'chun@test.com',
  crypt('1234', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"chunlam","display_name":"Chun Lam"}',
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
  'brian@test.com',
  crypt('1234', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"brianchong","display_name":"Brian Chong"}',
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
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Sam Feldman',
  'Chun Lam',
  'fine',
  2.00,
  'Snoring too loud',
  NOW() - INTERVAL '2 days'
),
(
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Brian Chong',
  'Sam Feldman',
  'warning',
  0.00,
  'Being a critter',
  NOW() - INTERVAL '1 day'
),
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Chun Lam',
  'Sam Feldman',
  'credit',
  3.00,
  'Not being a critter',
  NOW() - INTERVAL '3 hours'
);