DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
        DROP EXTENSION timescaledb;
    END IF;
END $$;