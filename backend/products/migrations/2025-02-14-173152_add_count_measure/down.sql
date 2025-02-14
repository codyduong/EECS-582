DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM units WHERE symbol = 'count') THEN
    DELETE FROM units WHERE symbol = 'count';
  END IF;
END $$;