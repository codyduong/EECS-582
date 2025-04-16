DROP TABLE IF EXISTS online_marketplaces;
DROP TABLE IF EXISTS physical_marketplaces;

-- Drop the generic marketplaces table
DROP TABLE IF EXISTS marketplaces;

-- Rename the companies table back to marketplaces
ALTER TABLE companies RENAME TO marketplaces;