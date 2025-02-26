DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username' AND is_nullable = 'YES') THEN
        ALTER TABLE users
        ALTER COLUMN username SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key' AND contype = 'u') AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users
        ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;
