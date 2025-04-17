-- Create temporary utility function for this migration only
CREATE OR REPLACE FUNCTION __migration_temp_column_exists(target_table text, target_column text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = current_schema() 
        AND table_name = target_table
        AND column_name = target_column
    );
END;
$$ LANGUAGE plpgsql;

-- Main down migration logic
DO $$
BEGIN
    -- Drop trigger if exists
    IF EXISTS (
        SELECT 1 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'products_search_vector_trigger'
        AND n.nspname = current_schema()
    ) THEN
        DROP TRIGGER products_search_vector_trigger ON products;
    END IF;

    -- Drop search vector function if exists
    IF EXISTS (
        SELECT 1 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'products_search_vector_update'
        AND n.nspname = current_schema()
    ) THEN
        DROP FUNCTION products_search_vector_update();
    END IF;

    -- Drop index if exists
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = current_schema()
        AND indexname = 'idx_products_search_vector'
    ) THEN
        DROP INDEX idx_products_search_vector;
    END IF;

    -- Drop column if exists
    IF __migration_temp_column_exists('products', 'search_vector') THEN
        ALTER TABLE products DROP COLUMN search_vector;
    END IF;
END $$;

-- Clean up temporary utility function
DROP FUNCTION IF EXISTS __migration_temp_column_exists(text, text);