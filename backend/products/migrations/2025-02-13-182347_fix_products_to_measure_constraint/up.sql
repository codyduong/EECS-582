ALTER TABLE products_to_measures
DROP CONSTRAINT products_to_measures_check,
ADD CONSTRAINT products_to_measures_check CHECK (
    (
        is_primary_measure = TRUE
        AND (
            is_converted IS NULL
            OR is_converted = FALSE
        )
    )
    OR (
        is_primary_measure = FALSE
    )
);