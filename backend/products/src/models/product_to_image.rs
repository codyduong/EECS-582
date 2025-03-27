/*
  Name: product_to_image.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-03-26
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, Clone, Deserialize, Serialize, ToSchema)]
#[diesel(belongs_to(crate::models::Product))]
#[diesel(table_name = crate::schema::products_to_images)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ProductToImage {
  pub id: i32,
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  pub image_url: String,
  pub created_at: chrono::NaiveDateTime,
  pub updated_at: chrono::NaiveDateTime,
}

pub type ProductToImageResponse = ProductToImage;

#[derive(Deserialize, ToSchema, Clone, Insertable, Debug)]
#[diesel(table_name = crate::schema::products_to_images)]
pub struct NewProductToImage {
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  pub image_url: String,
}

#[derive(Deserialize, ToSchema)]
#[serde(untagged)]
pub enum NewProductToImageUnion {
  Single(NewProductToImage),
  Multiple(Vec<NewProductToImage>),
}

impl From<NewProductToImageUnion> for Vec<NewProductToImage> {
  fn from(r: NewProductToImageUnion) -> Self {
    match r {
      NewProductToImageUnion::Single(new_product) => vec![new_product],
      NewProductToImageUnion::Multiple(new_products) => new_products,
    }
  }
}
