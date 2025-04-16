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
use diesel::insert_into;
use diesel::ExpressionMethods;
use diesel::JoinOnDsl;
use diesel::QueryDsl;
use diesel::RunQueryDsl;
use diesel::SelectableHelper;
use serde::Deserialize;
use std::vec::Vec;
use validator_rs::ValidatorBuilder;

pub(crate) const V1_PATH: &str = "/api/v1/marketplaces";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope(V1_PATH).service(get_marketplace).service(get_marketplaces));
  }
}

#[derive(Deserialize)]
struct MarketplaceParams {
  company_id: Option<i32>,
  company_name: Option<String>,
}

fn db_get_marketplace(
  pool: web::Data<Pool>,
  id: &i32,
  params: MarketplaceParams,
) -> anyhow::Result<MarketplaceResponse> {
  let mut conn = pool.get()?;

  let mut query = marketplaces::table
    .find(id)
    .inner_join(companies::table.on(marketplaces::company_id.eq(companies::id)))
    .left_join(physical_marketplaces::table.on(marketplaces::id.eq(physical_marketplaces::id)))
    .left_join(online_marketplaces::table.on(marketplaces::id.eq(online_marketplaces::id)))
    .into_boxed();

  if let Some(company_id) = params.company_id {
    query = query.filter(marketplaces::company_id.eq(company_id))
  }

  if let Some(company_name) = params.company_name {
    query = query.filter(companies::name.eq(company_name))
  }

  let (marketplace, company, physical_marketplace, online_marketplace) = query
    .select((
      Marketplace::as_select(),
      Company::as_select(),
      Option::<PhysicalMarketplace>::as_select(),
      Option::<OnlineMarketplace>::as_select(),
    ))
    .get_result::<(
      Marketplace,
      Company,
      Option<PhysicalMarketplace>,
      Option<OnlineMarketplace>,
    )>(&mut conn)?;

  Ok(MarketplaceResponse {
    marketplace,
    company,
    physical_marketplace,
    online_marketplace,
  })
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = MarketplaceResponse),
    (status = 401),
    (status = 500),
  ),
  params(
    ("id" = i32, Path, description = "id of the marketplace"),
    ("company_id" = Option<i32>, Query, description = "Filter by specific company id"),
    ("company_name" = Option<String>, Query, description = "Filter by specific company name"),
  ),
  security(
    ("http" = [""])
  )
)]
#[get("/{id}")]
pub(crate) async fn get_marketplace(
  id: web::Path<i32>,
  db: web::Data<Pool>,
  // auth: BearerAuth,
  query: web::Query<MarketplaceParams>,
) -> Result<HttpResponse, actix_web::Error> {
  // let claims = auth::get_claims(&auth)?;
  // ValidatorBuilder::new()
  //   .with_or(vec![PermissionName::ReadAll, PermissionName::ReadMarketplace])
  //   .validate(&claims.permissions)?;

  let result = { web::block(move || db_get_marketplace(db, &id, query.into_inner())).await };

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

fn db_get_marketplaces(pool: web::Data<Pool>, params: MarketplaceParams) -> anyhow::Result<Vec<MarketplaceResponse>> {
  let mut conn = pool.get()?;

  let mut query = marketplaces::table
    .inner_join(companies::table.on(marketplaces::company_id.eq(companies::id)))
    .left_join(physical_marketplaces::table.on(marketplaces::id.eq(physical_marketplaces::id)))
    .left_join(online_marketplaces::table.on(marketplaces::id.eq(online_marketplaces::id)))
    .into_boxed();

  if let Some(company_id) = params.company_id {
    query = query.filter(marketplaces::company_id.eq(company_id))
  }

  if let Some(company_name) = params.company_name {
    query = query.filter(companies::name.eq(company_name))
  }

  let res = query
    .select((
      Marketplace::as_select(),
      Company::as_select(),
      Option::<PhysicalMarketplace>::as_select(),
      Option::<OnlineMarketplace>::as_select(),
    ))
    .load::<(
      Marketplace,
      Company,
      Option<PhysicalMarketplace>,
      Option<OnlineMarketplace>,
    )>(&mut conn)?;

  let fixed = res
    .into_iter()
    .map(
      |(marketplace, company, physical_marketplace, online_marketplace)| MarketplaceResponse {
        marketplace,
        company,
        physical_marketplace,
        online_marketplace,
      },
    )
    .collect();

  Ok(fixed)
}

#[utoipa::path(
  context_path = V1_PATH,
  params(
    ("company_id" = Option<i32>, Query, description = "Filter by specific company id"),
    ("company_name" = Option<String>, Query, description = "Filter by specific company name"),
  ),
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
pub(crate) async fn get_marketplaces(
  db: web::Data<Pool>,
  // auth: BearerAuth
  query: web::Query<MarketplaceParams>,
) -> Result<HttpResponse, actix_web::Error> {
  // let claims = auth::get_claims(&auth)?;
  // ValidatorBuilder::new()
  //   .with_scope(PermissionName::ReadAll)
  //   .validate(&claims.permissions)?;

  let result = { web::block(move || db_get_marketplaces(db, query.into_inner())).await };

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
  #[allow(unused_variables)] pool: web::Data<Pool>,
  #[allow(unused_variables)] new_marketplace: web::Json<NewMarketplace>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_scope(PermissionName::CreateAll)
    .validate(&claims.permissions)?;

  log::error!("This endpoint has not been updated");
  return Err(ServiceError::InternalServerError)?;

  #[allow(unreachable_code)]
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
