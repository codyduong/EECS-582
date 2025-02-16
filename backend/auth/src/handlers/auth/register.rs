/*
  Name: mod.rs

  Description:
  The endpoint handler for `/api/v1/register`

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
*/

use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use crate::RESERVED_TEST_USERNAMES;
use actix_web::{post, web, HttpResponse};
use bcrypt::hash;
use diesel::{insert_into, prelude::*};
use serde::Deserialize;
use utoipa::ToSchema;

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = CREATED)
  ),
)]
#[post("/register")]
pub(crate) async fn register_route(
  db: web::Data<crate::Pool>,
  new_user: web::Json<RegisterRequest>,
) -> Result<HttpResponse, ServiceError> {
  // guard against registering reserved names
  if RESERVED_TEST_USERNAMES.contains(&new_user.username.as_str()) {
    // todo better error here
    return Err(ServiceError::InternalServerError);
  }

  let hashed = hash(&new_user.password, 10).map_err(|err| {
    log::error!("Failed to hash: {}", err);
    ServiceError::InternalServerError
  })?;
  let user = NewUser {
    username: &new_user.username,
    email: &new_user.email,
    password_hash: &hashed,
  };

  let mut conn = db.get().unwrap();

  insert_into(users::table)
    .values(&user)
    .execute(&mut conn)
    .map_err(|err| {
      log::error!("Failed to inset user: {}", err);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Created().finish())
}

#[derive(Deserialize, ToSchema)]
struct RegisterRequest {
  pub username: String,
  pub email: String,
  pub password: String,
}
