-- 1. Drop the new foreign key constraint
ALTER TABLE products_to_measures
DROP CONSTRAINT products_to_measures_gtin_fkey;

-- 2. Drop the check constraint
ALTER TABLE products
DROP CONSTRAINT check_gtin;

-- 3. Change the gtin column back to CHAR(14) in products table
ALTER TABLE products
ALTER COLUMN gtin TYPE CHAR(14) USING gtin::TEXT;

-- 4. Revert the data type of the foreign key column in products_to_measures if it was changed
DO $$
DECLARE
    gtin_column_type TEXT;
BEGIN
    SELECT data_type INTO gtin_column_type
    FROM information_schema.columns
    WHERE table_name = 'products_to_measures' AND column_name = 'gtin';

    IF gtin_column_type = 'numeric' THEN  -- Check if it's numeric now
        ALTER TABLE products_to_measures
        ALTER COLUMN gtin TYPE CHAR(14) USING gtin::TEXT; -- Or the original type
    END IF;
END $$;


-- 5. Recreate the original foreign key constraint (referencing the CHAR(14) column)
ALTER TABLE products_to_measures
ADD CONSTRAINT products_to_measures_gtin_fkey
FOREIGN KEY (gtin) REFERENCES products(gtin);  -- Recreate with original CHAR(14) type


-- 6. Drop the validation function
DROP FUNCTION validate_gtin(gtin VARCHAR);