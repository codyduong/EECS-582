DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products_to_images') THEN
        CREATE TABLE products_to_images (
            id SERIAL PRIMARY KEY,
            gtin CHAR(14) NOT NULL REFERENCES products(gtin),
            image_url TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (gtin, image_url)
        );

        CREATE INDEX idx_products_to_images_gtin ON products_to_images (gtin);
        CREATE INDEX idx_products_to_images_image_url ON products_to_images (image_url);
    END IF;
END $$;