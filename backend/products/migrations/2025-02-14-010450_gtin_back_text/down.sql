-- DOWN script: Revert GTIN to NUMERIC

-- 1. Drop the foreign key constraint
ALTER TABLE products_to_measures
DROP CONSTRAINT IF EXISTS products_to_measures_gtin_fkey;

-- 2. Drop the check constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_gtin;

-- 3. Drop the validation function
DROP FUNCTION IF EXISTS validate_gtin (gtin TEXT);
-- Drop the TEXT version

-- 4. Change the gtin column type in products table back to NUMERIC(14,0)
ALTER TABLE products
ALTER COLUMN gtin TYPE NUMERIC(14, 0) USING gtin::NUMERIC(14,0);

-- 5. Change the gtin column type in products_to_measures table back to NUMERIC(14,0)
ALTER TABLE products_to_measures
ALTER COLUMN gtin TYPE NUMERIC(14, 0) USING gtin::NUMERIC(14,0);

-- 6. Create or replace the original numeric validation function
CREATE OR REPLACE FUNCTION validate_gtin(gtin VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    gtin_length INT;
    calculated_check_digit INT;
    provided_check_digit INT;
    gtin_numeric VARCHAR;
BEGIN
    gtin_numeric := regexp_replace(gtin, '[^0-9]', '', 'g');
    gtin_length := length(gtin_numeric);

    IF gtin_length NOT IN (8, 12, 13, 14) THEN
        RETURN FALSE;
    END IF;

    calculated_check_digit := (
        (substring(gtin_numeric, 1, 1)::INT + substring(gtin_numeric, 3, 1)::INT + substring(gtin_numeric, 5, 1)::INT + substring(gtin_numeric, 7, 1)::INT + substring(gtin_numeric, 9, 1)::INT + substring(gtin_numeric, 11, 1)::INT + substring(gtin_numeric, 13, 1)::INT) * 3 +
        (substring(gtin_numeric, 2, 1)::INT + substring(gtin_numeric, 4, 1)::INT + substring(gtin_numeric, 6, 1)::INT + substring(gtin_numeric, 8, 1)::INT + substring(gtin_numeric, 10, 1)::INT + substring(gtin_numeric, 12, 1)::INT)
    ) % 10;

    IF gtin_length = 8 THEN
        provided_check_digit := substring(gtin_numeric, 8, 1)::INT;
    ELSIF gtin_length = 12 THEN
        provided_check_digit := substring(gtin_numeric, 12, 1)::INT;
    ELSIF gtin_length = 13 THEN
        provided_check_digit := substring(gtin_numeric, 13, 1)::INT;
    ELSE -- gtin_length = 14
        provided_check_digit := substring(gtin_numeric, 14, 1)::INT;
    END IF;

    IF (10 - calculated_check_digit) % 10 != provided_check_digit THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Add the check constraint to products table (using the original function)
ALTER TABLE products
ADD CONSTRAINT check_gtin CHECK (validate_gtin(gtin::VARCHAR));

-- 8. Recreate the foreign key constraint (referencing the NUMERIC column)
ALTER TABLE products_to_measures
ADD CONSTRAINT products_to_measures_gtin_fkey FOREIGN KEY (gtin) REFERENCES products (gtin);