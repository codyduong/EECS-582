/*
  Name: physical_marketplace.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-12 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `product_to_measure` table must exist in the database.
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Clone)]
#[diesel(belongs_to(crate::models::Marketplace))]
#[diesel(table_name = crate::schema::products_to_measures)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ProductToMeasure {
  pub id: i64,
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  pub created_at: chrono::NaiveDateTime,
  pub unit_id: i32,
  #[schema(value_type = String)]
  pub amount: bigdecimal::BigDecimal,
  pub is_primary_measure: bool,
  pub is_converted: Option<bool>,
  #[schema(value_type = f64)]
  pub raw_amount: Option<bigdecimal::BigDecimal>,
}

#[derive(Deserialize, Serialize, ToSchema, Clone)]
pub struct ProductToMeasureResponse {
  #[serde(flatten)]
  pub product_to_measure: ProductToMeasure,
  pub unit: super::Unit,
}

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::products_to_measures)]
pub struct NewProductToMeasure {
  pub gtin: String,
  pub unit_id: i32,
  pub amount: bigdecimal::BigDecimal,
  pub is_primary_measure: bool,
  pub is_converted: Option<bool>,
  pub raw_amount: Option<bigdecimal::BigDecimal>,
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct NewProductToMeasurePartial {
  #[schema(value_type = f64)]
  pub amount: bigdecimal::BigDecimal,
  pub is_primary_measure: bool,
  pub is_converted: Option<bool>,
  #[schema(value_type = f64)]
  pub raw_amount: Option<bigdecimal::BigDecimal>,
}

impl NewProductToMeasurePartial {
  pub fn convert(self, gtin: String, unit_id: i32) -> NewProductToMeasure {
    NewProductToMeasure {
      gtin,
      unit_id,
      amount: self.amount,
      is_primary_measure: self.is_primary_measure,
      is_converted: self.is_converted,
      raw_amount: self.raw_amount,
    }
  }
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct NewProductToMeasurePost {
  #[serde(flatten)]
  pub new_product_to_measure: NewProductToMeasurePartialUnion,
  pub unit: super::UnitSymbol,
}

#[derive(Deserialize, ToSchema, Clone)]
#[serde(untagged)]
pub enum NewProductToMeasurePartialUnion {
  Single(NewProductToMeasurePartial),
  Multiple(Vec<NewProductToMeasurePartial>),
}

impl From<NewProductToMeasurePartialUnion> for Vec<NewProductToMeasurePartial> {
  fn from(r: NewProductToMeasurePartialUnion) -> Self {
    match r {
      NewProductToMeasurePartialUnion::Single(new_product_to_measure) => vec![new_product_to_measure],
      NewProductToMeasurePartialUnion::Multiple(new_product_to_measures) => new_product_to_measures,
    }
  }
}
