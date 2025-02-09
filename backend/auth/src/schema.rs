// @generated automatically by Diesel CLI.

diesel::table! {
    permissions (id) {
        id -> Int4,
        name -> Text,
    }
}

diesel::table! {
    roles (id) {
        id -> Int4,
        name -> Text,
    }
}

diesel::table! {
    roles_to_permissions (role_id, permission_id) {
        role_id -> Int4,
        permission_id -> Int4,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        email -> Text,
        created_at -> Timestamp,
        deleted -> Bool,
        deleted_at -> Nullable<Timestamp>,
        password_hash -> Text,
        username -> Text,
    }
}

diesel::table! {
    users_to_roles (user_id, role_id) {
        user_id -> Int4,
        role_id -> Int4,
        created_at -> Timestamp,
        active -> Bool,
    }
}

diesel::joinable!(roles_to_permissions -> permissions (permission_id));
diesel::joinable!(roles_to_permissions -> roles (role_id));
diesel::joinable!(users_to_roles -> roles (role_id));
diesel::joinable!(users_to_roles -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(permissions, roles, roles_to_permissions, users, users_to_roles,);
