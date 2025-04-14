// @generated automatically by Diesel CLI.

diesel::table! {
    marketplaces (id) {
        id -> Int4,
        name -> Text,
    }
}

diesel::table! {
    physical_marketplaces (open_location_code) {
        #[max_length = 15]
        open_location_code -> Bpchar,
        marketplace_id -> Int4,
        deleted -> Bool,
        created_at -> Timestamp,
    }
}

diesel::table! {
    products (gtin) {
        gtin -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        #[max_length = 255]
        sku -> Nullable<Varchar>,
        productname -> Text,
        sellsinraw -> Bool,
    }
}

diesel::table! {
    products_to_images (id) {
        id -> Int4,
        #[max_length = 14]
        gtin -> Bpchar,
        image_url -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    products_to_measures (id) {
        gtin -> Text,
        created_at -> Timestamp,
        unit_id -> Int4,
        amount -> Numeric,
        is_primary_measure -> Bool,
        is_converted -> Nullable<Bool>,
        raw_amount -> Nullable<Numeric>,
        id -> Int4,
    }
}

diesel::table! {
    shopping_list (id) {
        id -> Int4,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    shopping_list_items (shopping_list_id, gtin) {
        shopping_list_id -> Int4,
        #[max_length = 255]
        gtin -> Varchar,
        amount -> Numeric,
        unit_id -> Nullable<Int4>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    shopping_list_to_user (shopping_list_id, user_id) {
        shopping_list_id -> Int4,
        user_id -> Int4,
    }
}

diesel::table! {
    units (id) {
        id -> Int4,
        symbol -> Text,
    }
}

diesel::joinable!(physical_marketplaces -> marketplaces (marketplace_id));
diesel::joinable!(products_to_images -> products (gtin));
diesel::joinable!(products_to_measures -> products (gtin));
diesel::joinable!(products_to_measures -> units (unit_id));
diesel::joinable!(shopping_list_items -> products (gtin));
diesel::joinable!(shopping_list_items -> shopping_list (shopping_list_id));
diesel::joinable!(shopping_list_items -> units (unit_id));
diesel::joinable!(shopping_list_to_user -> shopping_list (shopping_list_id));

diesel::allow_tables_to_appear_in_same_query!(
  marketplaces,
  physical_marketplaces,
  products,
  products_to_images,
  products_to_measures,
  shopping_list,
  shopping_list_items,
  shopping_list_to_user,
  units,
);
