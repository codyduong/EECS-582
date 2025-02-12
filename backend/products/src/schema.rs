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
        gtin -> Numeric,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        #[max_length = 255]
        sku -> Nullable<Varchar>,
        productname -> Text,
        sellsinraw -> Bool,
    }
}

diesel::table! {
    products_to_measures (id) {
        id -> Int8,
        gtin -> Numeric,
        created_at -> Timestamp,
        unit_id -> Int4,
        amount -> Numeric,
        is_primary_measure -> Bool,
        is_converted -> Nullable<Bool>,
        raw_amount -> Nullable<Numeric>,
    }
}

diesel::table! {
    units (id) {
        id -> Int4,
        symbol -> Text,
    }
}

diesel::joinable!(physical_marketplaces -> marketplaces (marketplace_id));
diesel::joinable!(products_to_measures -> products (gtin));
diesel::joinable!(products_to_measures -> units (unit_id));

diesel::allow_tables_to_appear_in_same_query!(
  marketplaces,
  physical_marketplaces,
  products,
  products_to_measures,
  units,
);
