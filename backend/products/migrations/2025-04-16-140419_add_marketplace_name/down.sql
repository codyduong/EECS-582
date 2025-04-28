DO $$
BEGIN
    IF EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'foo' AND column_name = 'name') THEN
        ALTER TABLE marketplaces
        DROP COLUMN name;
    END IF;
END$$;