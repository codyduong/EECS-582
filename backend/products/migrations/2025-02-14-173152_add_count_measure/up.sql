DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM units WHERE symbol = 'count') THEN
    INSERT INTO units (symbol) VALUES ('count');
  END IF;
END $$;