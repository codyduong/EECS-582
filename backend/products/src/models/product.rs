/*
  Name: product.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-12 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-08 - Cody Duong - match schema correctly
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `products` table must exist in the database.
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Eq, Clone)]
#[diesel(table_name = crate::schema::products)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Product {
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  pub created_at: chrono::NaiveDateTime,
  pub updated_at: chrono::NaiveDateTime,
  pub sku: Option<String>,
  pub productname: String,
  pub sellsinraw: bool,
  pub description: Option<String>,
}

#[derive(Deserialize, Serialize, ToSchema, Clone)]
pub struct ProductResponse {
  #[serde(flatten)]
  pub product: Product,
  pub measures: Vec<super::ProductToMeasureResponse>,
  pub images: Vec<super::ProductToImageResponse>,
}

#[derive(Deserialize, Insertable, ToSchema, Clone, Debug)]
#[diesel(table_name = crate::schema::products)]
pub struct NewProduct {
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  pub sku: Option<String>,
  pub productname: String,
  pub description: Option<String>,
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct NewProductPost {
  #[serde(flatten)]
  pub new_product: NewProduct,
  pub measures: super::NewProductToMeasurePartialUnion,
  pub images: Option<super::NewProductToImagePartialUnion>,
}

#[derive(Deserialize, ToSchema)]
#[serde(untagged)]
pub enum NewProductPostUnion {
  Single(NewProductPost),
  Multiple(Vec<NewProductPost>),
}

impl From<NewProductPostUnion> for Vec<NewProductPost> {
  fn from(r: NewProductPostUnion) -> Self {
    match r {
      NewProductPostUnion::Single(new_product) => vec![new_product],
      NewProductPostUnion::Multiple(new_products) => new_products,
    }
  }
}
