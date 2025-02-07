use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::{web, HttpResponse};
use diesel::{QueryDsl, RunQueryDsl};
use std::vec::Vec;

fn db_get_user_by_id(pool: web::Data<Pool>, user_id: i32) -> Result<User, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  users::table.find(user_id).get_result::<User>(&mut conn)
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = UserResponse)
  ),
  params(
    ("id" = i32, Path, description = "User id")
  ),
  security(
    ("http" = [])
  )
)]
#[get("/{id}")]
pub(crate) async fn get_user_route(
  user_id: web::Path<i32>,
  db: web::Data<Pool>,
) -> Result<HttpResponse, actix_web::Error> {
  let result = {
    let user_id = user_id.clone();
    web::block(move || db_get_user_by_id(db, user_id)).await
  };

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(Into::<UserResponse>::into(res))),
    Ok(Err(err)) => match err {
      diesel::result::Error::NotFound => {
        log::warn!("User not found {}", user_id);
        Ok(Err(ServiceError::NotFound(Some("User not found".to_string())))?)
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
