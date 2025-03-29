DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_to_measures_gtin_fkey') THEN
        ALTER TABLE products_to_measures DROP CONSTRAINT products_to_measures_gtin_fkey;
        ALTER TABLE products_to_measures
            ADD CONSTRAINT products_to_measures_gtin_fkey
            FOREIGN KEY (gtin) REFERENCES products (gtin) ON DELETE CASCADE;
    END IF;
END $$;