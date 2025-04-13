INSERT INTO permissions (name)
SELECT name
FROM (
    VALUES
        ('create:user'), ('read:user'), ('update:user'), ('delete:user')
) AS new_permissions(name)
WHERE NOT EXISTS (
    SELECT 1
    FROM permissions
    WHERE permissions.name = new_permissions.name
);