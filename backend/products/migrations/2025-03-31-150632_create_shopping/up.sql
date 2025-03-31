DO $$
BEGIN

CREATE TABLE IF NOT EXISTS shopping_list (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shopping_list_to_user (
    shopping_list_id INTEGER REFERENCES shopping_list(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (shopping_list_id, user_id)
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
    shopping_list_id INTEGER REFERENCES shopping_list(id) ON DELETE CASCADE,
    gtin VARCHAR(255) REFERENCES products(gtin) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    unit_id INT REFERENCES units(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (shopping_list_id, gtin)
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_to_user_user_id ON shopping_list_to_user (user_id);

END $$;