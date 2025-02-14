-- UP script: Migrate GTIN to TEXT

-- 1. Drop the foreign key constraint
ALTER TABLE products_to_measures
DROP CONSTRAINT IF EXISTS products_to_measures_gtin_fkey;

-- 2. Drop the check constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_gtin;

-- 3. Drop the validation function (if it exists)
DROP FUNCTION IF EXISTS validate_gtin (gtin VARCHAR);

-- 4. Change the gtin column type in products table to TEXT
ALTER TABLE products ALTER COLUMN gtin TYPE TEXT;

-- 5. Change the gtin column type in products_to_measures table to TEXT
ALTER TABLE products_to_measures ALTER COLUMN gtin TYPE TEXT;

-- 6. Create or replace the new validation function for TEXT GTINs
CREATE OR REPLACE FUNCTION validate_gtin(gtin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    gtin_numeric TEXT;
    gtin_length INT;
    total INT := 0;
    i INT;
    calculated_check_digit INT;
    provided_check_digit INT;
BEGIN
    -- Remove non-numeric characters
    gtin_numeric := regexp_replace(gtin, '[^0-9]', '', 'g');
    gtin_length := length(gtin_numeric);

    -- Check if the length is valid
    IF gtin_length NOT IN (8, 12, 13, 14) THEN
        RETURN FALSE;
    END IF;

    -- Calculate the sum for the check digit
    FOR i IN 1..gtin_length - 1 LOOP
        IF i % 2 = 0 THEN
            total := total + substring(gtin_numeric, i, 1)::INT; -- Even positions
        ELSE
            total := total + substring(gtin_numeric, i, 1)::INT * 3; -- Odd positions multiplied by 3
        END IF;
    END LOOP;

    -- Calculate the check digit
    calculated_check_digit := (10 - (total % 10)) % 10;

    -- Get the provided check digit
    provided_check_digit := substring(gtin_numeric, gtin_length, 1)::INT;

    -- Validate the check digit
    RETURN calculated_check_digit = provided_check_digit;
END;
$$ LANGUAGE plpgsql;

-- 7. Add the check constraint to products table (using the new function)
ALTER TABLE products
ADD CONSTRAINT check_gtin CHECK (validate_gtin (gtin));

-- 8. Recreate the foreign key constraint (referencing the TEXT column)
ALTER TABLE products_to_measures
ADD CONSTRAINT products_to_measures_gtin_fkey FOREIGN KEY (gtin) REFERENCES products (gtin);