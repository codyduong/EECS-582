use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::middleware::HttpAuthentication;
use auth::errors::ServiceError;
use auth::models::PermissionName;
use auth::validator::ValidatorBuilder;
use diesel::{QueryDsl, RunQueryDsl};
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

fn db_get_product_by_gtin(
  pool: web::Data<Pool>,
  gtin: bigdecimal::BigDecimal,
) -> Result<Product, diesel::result::Error> {
  let mut conn = pool.get().unwrap();

  products::table.find(gtin).get_result::<Product>(&mut conn)
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = Product)
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
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(Into::<Product>::into(res))),
    Ok(Err(err)) => match err {
      diesel::result::Error::NotFound => {
        log::warn!("Product not found {}", gtin);
        Ok(Err(ServiceError::NotFound(Some("Product not found".to_string())))?)
      }
      _ => {
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

fn db_get_all_products(pool: web::Data<Pool>) -> Result<Vec<Product>, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  let items = products::table.load::<Product>(&mut conn)?;
  Ok(items)
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = Vec<Product>)
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
