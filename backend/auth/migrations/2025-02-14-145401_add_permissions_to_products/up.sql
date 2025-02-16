INSERT INTO permissions (name)
SELECT name
FROM (
    VALUES
        ('create:product'), ('read:product'), ('update:product'), ('delete:product'),
        ('create:marketplace'), ('read:marketplace'), ('update:marketplace'), ('delete:marketplace'),
        ('create:price_report'), ('read:price_report'), ('update:price_report'), ('delete:price_report')
) AS new_permissions(name)
WHERE NOT EXISTS (
    SELECT 1
    FROM permissions
    WHERE permissions.name = new_permissions.name
);