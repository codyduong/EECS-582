use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Eq, Clone)]
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

#[derive(Deserialize, Serialize, ToSchema, Clone)]
pub struct ProductResponse {
  #[serde(flatten)]
  pub product: Product,
  pub measures: Vec<super::ProductToMeasureResponse>,
}
