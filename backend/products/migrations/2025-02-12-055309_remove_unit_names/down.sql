ALTER TABLE units ADD COLUMN name TEXT UNIQUE;

UPDATE units SET name = 'fluid ounce' WHERE symbol = 'fl oz';

UPDATE units SET name = 'ounce' WHERE symbol = 'oz';

UPDATE units SET name = 'milliliter' WHERE symbol = 'mL';

UPDATE units SET name = 'gram' WHERE symbol = 'g';

ALTER TABLE units ALTER COLUMN name SET NOT NULL;