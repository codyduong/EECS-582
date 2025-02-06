use crate::errors::ServiceError;

use super::models::User;
use super::schema::users::dsl::*;
use super::Pool;
use actix_web::get;
use actix_web::{web, Error, HttpResponse};
use diesel::QueryDsl;
use diesel::RunQueryDsl;
use serde::{Deserialize, Serialize};
use std::vec::Vec;

#[derive(Debug, Serialize, Deserialize)]
pub struct InputUser {
  pub first_name: String,
  pub last_name: String,
  pub email: String,
}

fn get_all_users(pool: web::Data<Pool>) -> Result<Vec<User>, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  let items = users.load::<User>(&mut conn)?;
  Ok(items)
}

#[utoipa::path(responses((status = OK, body = User)))]
#[get("/users")]
pub async fn get_users(db: web::Data<Pool>) -> Result<HttpResponse, Error> {
  let result = web::block(move || get_all_users(db)).await;

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(res)),
    Ok(Err(_)) => Ok(Err(ServiceError::InternalServerError)?),
    Err(_) => Ok(Err(ServiceError::InternalServerError)?),
  }
}

// fn db_get_user_by_id(pool: web::Data<Pool>, user_id: i32) -> Result<User, diesel::result::Error> {
//   let mut conn = pool.get().unwrap();
//   users.find(user_id).get_result::<User>(&mut conn)
// }

// // Handler for GET /users/{id}
// pub async fn get_user_by_id(db: web::Data<Pool>, user_id: web::Path<i32>) -> Result<HttpResponse, Error> {
//   Ok(
//     web::block(move || db_get_user_by_id(db, user_id.into_inner()))
//       .await
//       .map(|user| HttpResponse::Ok().json(user))
//       .map_err(|_| HttpResponse::InternalServerError())?,
//   )
// }
