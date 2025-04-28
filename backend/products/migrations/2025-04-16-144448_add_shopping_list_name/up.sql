DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'shopping_list' AND column_name = 'name') THEN
        ALTER TABLE shopping_list
        ADD COLUMN name TEXT;
    END IF;
END$$;