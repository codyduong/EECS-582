use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Eq, Clone)]
#[diesel(belongs_to(crate::models::Marketplace))]
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
}

#[derive(Deserialize, Serialize, ToSchema, Clone)]
pub struct ProductResponse {
  #[serde(flatten)]
  pub product: Product,
  pub measures: Vec<super::ProductToMeasureResponse>,
}

#[derive(Deserialize, Insertable, ToSchema, Clone, Debug)]
#[diesel(table_name = crate::schema::products)]
pub struct NewProduct {
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  pub sku: Option<String>,
  pub productname: String,
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct NewProductPost {
  #[serde(flatten)]
  pub new_product: NewProduct,
  pub measures: super::NewProductToMeasurePost,
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