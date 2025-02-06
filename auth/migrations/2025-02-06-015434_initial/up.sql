CREATE TABLE users (
    id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    CHECK (
        (
            deleted = TRUE
            AND deleted_at IS NOT NULL
        )
        OR (
            deleted = FALSE
            AND deleted_at IS NULL
        )
    )
);

CREATE TABLE roles (
    id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('admin');

CREATE TABLE permissions (
    id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO permissions (name) VALUES ('VIEW_USERS');

CREATE TABLE users_to_roles (
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    role_id INT REFERENCES roles (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE roles_to_permissions (
    role_id INT REFERENCES roles (id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions (id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

INSERT INTO
    roles_to_permissions
VALUES (
        (
            SELECT id
            FROM roles
            WHERE
                roles.name = 'admin'
        ),
        (
            SELECT id
            FROM permissions
            WHERE
                permissions.name = 'VIEW_USERS'
        )
    );
