DELETE FROM price_report_to_marketplaces;
DELETE FROM marketplaces;

DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'name') THEN
        ALTER TABLE marketplaces
        ADD COLUMN name TEXT NOT NULL;
    END IF;
END$$;