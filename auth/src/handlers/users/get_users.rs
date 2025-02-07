use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::{web, HttpResponse};
use diesel::RunQueryDsl;
use std::vec::Vec;

fn db_get_all_users(pool: web::Data<Pool>) -> Result<Vec<User>, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  let items = users::table.load::<User>(&mut conn)?;
  Ok(items)
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = Vec<User>)
  ),
  security(
    ("http" = [])
  )
)]
#[get("/")]
pub(crate) async fn get_users_route(db: web::Data<Pool>) -> Result<HttpResponse, actix_web::Error> {
  let result = web::block(move || db_get_all_users(db)).await;

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
