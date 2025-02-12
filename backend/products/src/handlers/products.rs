use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::middleware::HttpAuthentication;
use anyhow::anyhow;
use auth::errors::ServiceError;
use auth::models::PermissionName;
use auth::validator::ValidatorBuilder;
use diesel::ExpressionMethods;
use diesel::JoinOnDsl;
use diesel::{QueryDsl, RunQueryDsl};
use std::collections::HashMap;
use std::vec::Vec;

pub(crate) const V1_PATH: &str = "/api/v1/products";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    let read_products_auth =
      HttpAuthentication::bearer(ValidatorBuilder::new().with_scope(PermissionName::ReadAll).build());
    config.service(
      web::scope(V1_PATH)
        .wrap(read_products_auth)
        .service(get_product)
        .service(get_products),
    );
    // let create_products_auth =
    //   HttpAuthentication::bearer(ValidatorBuilder::new().with_scope(PermissionName::CreateAll).build());
    // config.service(web::scope(V1_PATH).wrap(create_products_auth).service(get_products_route));
  }
}

fn db_get_product_by_gtin(pool: web::Data<Pool>, gtin: bigdecimal::BigDecimal) -> anyhow::Result<ProductExternal> {
  let mut conn = pool.get().unwrap();

  let result = products::table
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .filter(products::gtin.eq(gtin))
    .load::<(Product, ProductToMeasure, Unit)>(&mut conn)?;

  fold_products_and_measures(result)
    .first()
    .cloned()
    .ok_or_else(|| anyhow!("Failed to find product"))
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = ProductExternal)
  ),
  params(
    ("gtin" = String, Path, description = "Global Trade Item Number (gtin)")
  ),
  security(
    ("http" = [])
  )
)]
#[get("/{gtin}")]
pub(crate) async fn get_product(
  gtin_str: web::Path<String>,
  db: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
  let gtin = match gtin_str.parse::<bigdecimal::BigDecimal>() {
    Ok(bd) => bd,
    Err(e) => {
      return Ok(HttpResponse::BadRequest().body(format!("Invalid GTIN format: {}", e)));
    }
  };

  let result = {
    let gtin = gtin.clone();
    web::block(move || db_get_product_by_gtin(db, gtin)).await
  };

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(Into::<ProductExternal>::into(res))),
    Ok(Err(err)) => match err.downcast_ref::<diesel::result::Error>() {
      Some(diesel::result::Error::NotFound) => {
        log::warn!("Product not found {}", gtin);
        Ok(Err(ServiceError::NotFound(Some("Product not found".to_string())))?)
      }
      Some(_) => {
        log::error!("{}", err);
        Ok(Err(ServiceError::InternalServerError)?)
      }
      None => {
        log::error!("{}", err);
        Ok(Err(ServiceError::InternalServerError)?)
      }
    },
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}

fn db_get_all_products(pool: web::Data<Pool>) -> Result<Vec<ProductExternal>, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  // let items = products::table.load::<Product>(&mut conn)?;

  let result = products::table
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .load::<(Product, ProductToMeasure, Unit)>(&mut conn)?;

  Ok(fold_products_and_measures(result))
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = Vec<ProductExternal>)
  ),
  security(
    ("http" = [])
  )
)]
#[get("/")]
pub(crate) async fn get_products(db: web::Data<Pool>) -> Result<HttpResponse, actix_web::Error> {
  let result = web::block(move || db_get_all_products(db)).await;

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

fn fold_products_and_measures(results: Vec<(Product, ProductToMeasure, Unit)>) -> Vec<ProductExternal> {
  results
    .into_iter()
    .fold(
      HashMap::<Product, Vec<(ProductToMeasure, Unit)>>::new(),
      |mut acc, (product, product_measure, unit)| {
        acc
          .entry(product) // Clone the product for the key
          .or_default()
          .push((product_measure, unit));
        acc
      },
    )
    .into_iter()
    .map(|(product, conjoined)| {
      let measures = conjoined
        .into_iter()
        .map(|(product_to_measure, unit)| ProductToMeasureExternal {
          product_to_measure,
          unit,
        })
        .collect();
      ProductExternal { product, measures }
    })
    .collect()
}
