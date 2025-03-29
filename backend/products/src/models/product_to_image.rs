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

#[derive(Deserialize, ToSchema, Clone)]
pub struct NewProductToImagePartial {
  pub image_url: String,
}

impl NewProductToImagePartial {
  pub fn convert(self, gtin: &str) -> NewProductToImage {
    NewProductToImage {
      gtin: gtin.to_owned(),
      image_url: self.image_url,
    }
  }
}

#[derive(Deserialize, ToSchema, Clone)]
#[serde(untagged)]
pub enum NewProductToImagePartialUnion {
  Single(NewProductToImagePartial),
  Multiple(Vec<NewProductToImagePartial>),
}

impl From<NewProductToImagePartial> for NewProductToImagePartialUnion {
  fn from(val: NewProductToImagePartial) -> Self {
    NewProductToImagePartialUnion::Single(val)
  }
}

impl From<Vec<NewProductToImagePartial>> for NewProductToImagePartialUnion {
  fn from(val: Vec<NewProductToImagePartial>) -> Self {
    NewProductToImagePartialUnion::Multiple(val)
  }
}

impl From<NewProductToImagePartialUnion> for Vec<NewProductToImagePartial> {
  fn from(r: NewProductToImagePartialUnion) -> Self {
    match r {
      NewProductToImagePartialUnion::Single(new_product) => vec![new_product],
      NewProductToImagePartialUnion::Multiple(new_products) => new_products,
    }
  }
}

impl NewProductToImagePartialUnion {
  pub fn convert(self, gtin: String) -> NewProductToImageUnion {
    match self {
      NewProductToImagePartialUnion::Single(new_product_to_image_partial) => {
        NewProductToImageUnion::Single(new_product_to_image_partial.convert(&gtin))
      }
      NewProductToImagePartialUnion::Multiple(new_product_to_image_partials) => NewProductToImageUnion::Multiple(
        new_product_to_image_partials
          .into_iter()
          .map(|v| v.convert(&gtin))
          .collect(),
      ),
    }
  }
}
