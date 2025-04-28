use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use auth::errors::ServiceError;
use diesel::QueryDsl;
use diesel::RunQueryDsl;
use std::vec::Vec;

pub(crate) const V1_PATH: &str = "/api/v1/companies";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope(V1_PATH).service(get_company).service(get_companies));
  }
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = CompanyResponse),
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
pub(crate) async fn get_company(
  id: web::Path<i32>,
  pool: web::Data<Pool>,
  // _auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  // let claims = auth::get_claims(&auth)?;
  // ValidatorBuilder::new()
  //   .with_or(vec![PermissionName::ReadAll, PermissionName::ReadMarketplace])
  //   .validate(&claims.permissions)?;

  let result = web::block(move || {
    let mut conn = pool.get()?;

    Ok::<CompanyResponse, anyhow::Error>(
      companies::table
        .find(id.into_inner())
        .get_result::<CompanyResponse>(&mut conn)?,
    )
  })
  .await;

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

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = Vec<CompanyResponse>),
    (status = 401),
    (status = 500),
  ),
  security(
    ("http" = [])
  )
)]
#[get("")]
pub(crate) async fn get_companies(
  pool: web::Data<Pool>,
  // _auth: BearerAuth
) -> Result<HttpResponse, actix_web::Error> {
  // let claims = auth::get_claims(&auth)?;
  // ValidatorBuilder::new()
  //   .with_scope(PermissionName::ReadAll)
  //   .validate(&claims.permissions)?;

  let result = web::block(move || {
    let mut conn = pool.get()?;

    Ok::<Vec<CompanyResponse>, anyhow::Error>(companies::table.load::<CompanyResponse>(&mut conn)?)
  })
  .await;

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
