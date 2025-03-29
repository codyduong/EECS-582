DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products_to_images') THEN
        DROP TABLE products_to_images;
    END IF;
END $$;