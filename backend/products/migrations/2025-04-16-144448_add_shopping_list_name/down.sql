DO $$
BEGIN
    IF EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'shopping_list' AND column_name = 'name') THEN
        ALTER TABLE shopping_list
        DROP COLUMN name;
    END IF;
END$$;