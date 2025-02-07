use crate::errors::ServiceError;
use crate::schema::*;
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

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser<'a> {
  pub username: &'a str,
  pub email: &'a str,
  pub password_hash: &'a str,
}
