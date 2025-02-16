DELETE FROM permissions WHERE name IN (
    'create:product', 'read:product', 'update:product', 'delete:product',
    'create:marketplace', 'read:marketplace', 'update:marketplace', 'delete:marketplace',
    'create:price_report', 'read:price_report', 'update:price_report', 'delete:price_report'
);