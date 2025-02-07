ALTER TABLE users
ADD password_hash TEXT NOT NULL,
ADD username TEXT NOT NULL UNIQUE;

INSERT INTO
    permissions (name)
VALUES ('create:all'),
    ('read:all'),
    ('update:all'),
    ('delete:all');

INSERT INTO roles (name) VALUES ('admin');

INSERT INTO
    roles_to_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
    CROSS JOIN permissions p
WHERE
    r.name = 'admin'
    AND p.name IN (
        'create:all',
        'read:all',
        'update:all',
        'delete:all'
    );
