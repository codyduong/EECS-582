use diesel::prelude::*;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Eq, Clone, JsonSchema)]
#[diesel(belongs_to(crate::models::Marketplace))]
#[diesel(table_name = crate::schema::products)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Product {
  #[schema(value_type = String, min_length = 8, max_length = 14)]
  pub gtin: bigdecimal::BigDecimal,
  pub created_at: chrono::NaiveDateTime,
  pub updated_at: chrono::NaiveDateTime,
  pub sku: Option<String>,
  pub productname: String,
  pub sellsinraw: bool,
}

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Clone, JsonSchema)]
#[diesel(belongs_to(crate::models::Marketplace))]
#[diesel(table_name = crate::schema::products_to_measures)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ProductToMeasure {
  pub id: i64,
  #[schema(value_type = String, min_length = 8, max_length = 14)]
  pub gtin: bigdecimal::BigDecimal,
  pub created_at: chrono::NaiveDateTime,
  pub unit_id: i32,
  #[schema(value_type = String)]
  pub amount: bigdecimal::BigDecimal,
  pub is_primary_measure: bool,
  pub is_converted: Option<bool>,
  #[schema(value_type = f64)]
  pub raw_amount: Option<bigdecimal::BigDecimal>,
}

#[derive(Deserialize, Serialize, ToSchema, Clone, JsonSchema)]
pub struct ProductToMeasureExternal {
  #[serde(flatten)]
  pub product_to_measure: ProductToMeasure,
  pub unit: super::Unit,
}

#[derive(Deserialize, Serialize, ToSchema, Clone, JsonSchema)]
pub struct ProductExternal {
  #[serde(flatten)]
  pub product: Product,
  pub measures: Vec<ProductToMeasureExternal>,
}
