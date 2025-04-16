CREATE TABLE IF NOT EXISTS iso_4217 (
    code CHAR(3) PRIMARY KEY,
    name VARCHAR(100),
    numeric_code SMALLINT,
    minor_unit SMALLINT
);

INSERT INTO iso_4217 (code, name, numeric_code, minor_unit)
VALUES ('USD', 'United States dollar', 840, 2)
ON CONFLICT (code) DO NOTHING;


-- Create the price_reports table
CREATE TABLE IF NOT EXISTS price_reports (
    id BIGSERIAL NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INT NOT NULL,
    gtin TEXT REFERENCES products(gtin),
    price NUMERIC NOT NULL,
    currency CHAR(3) NOT NULL,
    PRIMARY KEY (id, reported_at),
    FOREIGN KEY (currency) REFERENCES iso_4217(code)
);

CREATE INDEX IF NOT EXISTS idx_price_reports_gtin_reported_at ON price_reports (gtin, reported_at);
CREATE INDEX IF NOT EXISTS idx_price_reports_reported_at ON price_reports (reported_at);
CREATE INDEX IF NOT EXISTS idx_price_reports_gtin ON price_reports (gtin);

-- Make price_reports a hypertable, partitioned by time
SELECT create_hypertable('price_reports', 'reported_at', if_not_exists => true);

-- Create the junction table price_report_marketplaces
CREATE TABLE IF NOT EXISTS price_report_to_marketplaces (
    price_report_id BIGINT NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL,
    marketplace_id INT NOT NULL,
    PRIMARY KEY (price_report_id, reported_at, marketplace_id),
    FOREIGN KEY (price_report_id, reported_at) REFERENCES price_reports(id, reported_at) ON DELETE CASCADE,
    FOREIGN KEY (marketplace_id) REFERENCES marketplaces(id)
);