-- Create temporary utility functions for this migration only
CREATE OR REPLACE FUNCTION __migration_temp_text_search_config_exists(config_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = config_name);
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION __migration_temp_index_exists(index_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = index_name);
END;
$$ LANGUAGE plpgsql;

-- Main migration logic using the temporary functions
DO $$
BEGIN
    -- Create English configuration if needed
    IF NOT __migration_temp_text_search_config_exists('english') THEN
        CREATE TEXT SEARCH CONFIGURATION english (COPY = simple);
        ALTER TEXT SEARCH CONFIGURATION english
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH english_stem;
    END IF;

    -- Add tsvector column if needed
    IF NOT __migration_temp_column_exists('products', 'search_vector') THEN
        ALTER TABLE products ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create the search vector function
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.productname, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'products_search_vector_trigger'
    ) THEN
        CREATE TRIGGER products_search_vector_trigger
        BEFORE INSERT OR UPDATE OF productname, description ON products
        FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();
    END IF;
END $$;

-- Update existing rows
UPDATE products SET 
    search_vector = 
        setweight(to_tsvector('english', COALESCE(productname, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Create index if needed
DO $$
BEGIN
    IF NOT __migration_temp_index_exists('idx_products_search_vector') THEN
        CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);
    END IF;
END $$;

-- Clean up temporary utility functions
DROP FUNCTION IF EXISTS __migration_temp_text_search_config_exists(text);
DROP FUNCTION IF EXISTS __migration_temp_column_exists(text, text);
DROP FUNCTION IF EXISTS __migration_temp_index_exists(text);