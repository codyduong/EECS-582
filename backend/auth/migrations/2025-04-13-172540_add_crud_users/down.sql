DELETE FROM permissions WHERE name IN (
    'create:user', 'read:user', 'update:user', 'delete:user'
);