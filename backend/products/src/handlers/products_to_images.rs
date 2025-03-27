/*
  Name: products.rs

  Description:
  The endpoint handler for `/api/v1/marketplace/XXX`

  Programmer: Cody Duong
  Date Created: 2025-03-26
  Revision History:
*/

use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use anyhow::anyhow;
use auth::errors::ServiceError;
use auth::models::PermissionName;
use auth::validator::ScopeRequirement;
use auth::validator::ValidatorBuilder;
use diesel::dsl::insert_into;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::{QueryDsl, RunQueryDsl};
use std::vec::Vec;

pub(crate) const V1_PATH: &str = "/api/v1/product_to_image";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope(V1_PATH).service(get_image));
  }
}

fn db_get_product_to_image_by_gtin(
  pool: web::Data<Pool>,
  gtin: String,
) -> anyhow::Result<Option<ProductToImageResponse>> {
  let mut conn = pool.get()?;

  let binding = products_to_images::table
    .filter(products_to_images::gtin.eq(gtin))
    .load::<ProductToImage>(&mut conn)?;

  let result = binding.first();

  Ok(result.cloned())
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = Option<ProductToImageResponse>),
    (status = 401),
  ),
  params(
    ("id" = String, Path)
  ),
  security(
    ("http" = [])
  )
)]
#[get("/{id}")]
pub(crate) async fn get_image(
  gtin: web::Path<String>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::ReadAll)
    .with_or(vec![ScopeRequirement::Scope(PermissionName::ReadProduct)])
    .validate(&auth)?;

  let result = {
    let gtin = gtin.clone();
    web::block(move || db_get_product_to_image_by_gtin(db, gtin)).await
  };

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(res)),
    Ok(Err(err)) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}

fn db_insert_image(new_images: Vec<NewProductToImage>, pool: web::Data<Pool>) -> anyhow::Result<bool> {
  let mut conn = pool.get()?;

  match conn.transaction(|conn| {
    insert_into(products_to_images::table)
      .values(new_images)
      .execute(conn)?;

    diesel::result::QueryResult::Ok(())
  }) {
    Ok(_) => (),
    Err(err) => {
      return Err(anyhow!("Adding product(s) failed: {}", err));
    }
  }

  Ok(true)
}

#[utoipa::path(
  context_path = V1_PATH,
  request_body(description = "An image url",
    content(
      (NewProductToImage),
      (Vec<NewProductToImage>),
    ),
  ),
  responses(
    (status = OK, body = bool),
    (status = 401),
    (status = 500),
  ),
  security(
    ("http" = [])
  )
)]
#[get("")]
pub(crate) async fn post_image(
  db: web::Data<Pool>,
  new_images_union: web::Json<NewProductToImageUnion>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::CreateAll)
    .with_or(vec![ScopeRequirement::Scope(PermissionName::CreateProduct)])
    .validate(&auth)?;

  let new_images: Vec<NewProductToImage> = new_images_union.into_inner().into();

  let result = web::block(move || db_insert_image(new_images, db)).await;

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(res)),
    Ok(Err(err)) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}
