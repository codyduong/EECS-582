// @generated automatically by Diesel CLI.

diesel::table! {
    companies (id) {
        id -> Int4,
        name -> Text,
    }
}

diesel::table! {
    iso_4217 (code) {
        #[max_length = 3]
        code -> Bpchar,
        #[max_length = 100]
        name -> Nullable<Varchar>,
        numeric_code -> Nullable<Int2>,
        minor_unit -> Nullable<Int2>,
    }
}

diesel::table! {
    marketplaces (id) {
        id -> Int4,
        company_id -> Int4,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        deleted -> Bool,
        deleted_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    online_marketplaces (id) {
        id -> Int4,
        uri -> Text,
    }
}

diesel::table! {
    physical_marketplaces (id) {
        id -> Int4,
        adr_address -> Text,
        place_id -> Nullable<Text>,
        open_location_code -> Text,
    }
}

diesel::table! {
    price_report_to_marketplaces (price_report_id, reported_at, marketplace_id) {
        price_report_id -> Int8,
        reported_at -> Timestamptz,
        marketplace_id -> Int4,
    }
}

diesel::table! {
    price_reports (id, reported_at) {
        id -> Int8,
        reported_at -> Timestamptz,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        created_by -> Int4,
        gtin -> Text,
        price -> Numeric,
        #[max_length = 3]
        currency -> Bpchar,
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
        description -> Nullable<Text>,
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

diesel::joinable!(marketplaces -> companies (company_id));
diesel::joinable!(online_marketplaces -> marketplaces (id));
diesel::joinable!(physical_marketplaces -> marketplaces (id));
diesel::joinable!(price_report_to_marketplaces -> marketplaces (marketplace_id));
diesel::joinable!(price_reports -> iso_4217 (currency));
diesel::joinable!(price_reports -> products (gtin));
diesel::joinable!(products_to_images -> products (gtin));
diesel::joinable!(products_to_measures -> products (gtin));
diesel::joinable!(products_to_measures -> units (unit_id));
diesel::joinable!(shopping_list_items -> products (gtin));
diesel::joinable!(shopping_list_items -> shopping_list (shopping_list_id));
diesel::joinable!(shopping_list_items -> units (unit_id));
diesel::joinable!(shopping_list_to_user -> shopping_list (shopping_list_id));

diesel::allow_tables_to_appear_in_same_query!(
  companies,
  iso_4217,
  marketplaces,
  online_marketplaces,
  physical_marketplaces,
  price_report_to_marketplaces,
  price_reports,
  products,
  products_to_images,
  products_to_measures,
  shopping_list,
  shopping_list_items,
  shopping_list_to_user,
  units,
);
