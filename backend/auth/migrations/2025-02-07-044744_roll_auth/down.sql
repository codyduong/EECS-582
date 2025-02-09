ALTER TABLE users 
DROP COLUMN password_hash,
DROP COLUMN username;

DELETE FROM users;
DELETE FROM roles CASCADE;
DELETE FROM permissions CASCADE;
