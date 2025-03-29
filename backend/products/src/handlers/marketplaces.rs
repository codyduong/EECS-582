/*
  Name: marketplace.rs

  Description:
  The endpoint handler for `/api/v1/marketplace/XXX`

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-14 - Cody Duong - add marketplace GET/POST
  - 2025-02-16 - Cody Duong - add comments
*/

use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::post;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use auth::errors::ServiceError;
use auth::models::PermissionName;
use auth::validator::ValidatorBuilder;
use diesel::insert_into;
use diesel::QueryDsl;
use diesel::RunQueryDsl;
use std::vec::Vec;

pub(crate) const V1_PATH: &str = "/api/v1/marketplaces";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope(V1_PATH).service(get_marketplace).service(get_marketplaces));
  }
}

fn db_get_marketplace(pool: web::Data<Pool>, id: &i32) -> anyhow::Result<MarketplaceResponse> {
  let mut conn = pool.get()?;

  Ok(marketplaces::table.find(id).get_result::<Marketplace>(&mut conn)?)
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = MarketplaceResponse),
    (status = 401),
    (status = 500),
  ),
  params(
    ("id" = i32, Path, description = "id")
  ),
  security(
    ("http" = [""])
  )
)]
#[get("/{id}")]
pub(crate) async fn get_marketplace(
  id: web::Path<i32>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::ReadAll)
    .validate(&auth)?;

  let result = { web::block(move || db_get_marketplace(db, &id)).await };

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

fn db_get_marketplaces(pool: web::Data<Pool>) -> anyhow::Result<Vec<MarketplaceResponse>> {
  let mut conn = pool.get()?;

  Ok(marketplaces::table.load::<Marketplace>(&mut conn)?)
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = Vec<MarketplaceResponse>),
    (status = 401),
    (status = 500),
  ),
  security(
    ("http" = [])
  )
)]
#[get("")]
pub(crate) async fn get_marketplaces(db: web::Data<Pool>, auth: BearerAuth) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::ReadAll)
    .validate(&auth)?;

  let result = { web::block(move || db_get_marketplaces(db)).await };

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

fn db_insert_marketplace(pool: web::Data<Pool>, new_marketplace: NewMarketplace) -> anyhow::Result<bool> {
  let mut conn = pool.get().unwrap();

  insert_into(marketplaces::table)
    .values(&new_marketplace)
    .execute(&mut conn)?;

  Ok(true)
}

#[utoipa::path(
  context_path = V1_PATH,
  request_body(description = "A marketplace",
    content(
      (NewMarketplace),
    ),
  ),
  responses(
    (status = OK, body = MarketplaceResponse),
    (status = 401),
    (status = 500),
  ),
  security(
    ("http" = []),
  ),
)]
#[post("")]
pub(crate) async fn post_marketplace(
  pool: web::Data<Pool>,
  new_marketplace: web::Json<NewMarketplace>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::CreateAll)
    .validate(&auth)?;

  let result = web::block(move || db_insert_marketplace(pool, new_marketplace.into_inner())).await;

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
