INSERT INTO users (email) VALUES ('cody.qd@gmail.com');

INSERT INTO
    users_to_roles (user_id, role_id)
VALUES (
        (
            SELECT id
            FROM users
            WHERE
                email = 'cody.qd@gmail.com'
        ),
        (
            SELECT id
            from roles
            WHERE
                name = 'admin'
        )
    );
