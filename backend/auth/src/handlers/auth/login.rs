/*
  Name: mod.rs

  Description:
  The endpoint handler for `/api/v1/login`

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
  - 2025-02-25 - @codyduong - support logging in w/ email as well as username
  - 2025-02-25 - @codyduong - rename `login_route` to `post_login`, add 'options_login'
  - 2025-02-26 - @codyduong - use web blocking to improve performance, see here https://actix.rs/docs/databases/
*/

use crate::errors::ServiceError;
use crate::handlers::auth::get_permissions;
use crate::models::*;
use crate::schema::*;
use actix_web::options;
use actix_web::{post, web, HttpResponse};
use bcrypt::verify;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = LoginResponse)
  ),
)]
#[post("/login")]
pub async fn login_route(
  db: web::Data<crate::Pool>,
  credentials: web::Json<LoginRequest>,
) -> Result<HttpResponse, actix_web::Error> {
  let users_maybe: Result<(User, Vec<PermissionName>, web::Json<LoginRequest>), ServiceError> = web::block(move || {
    let mut conn = db.get().unwrap();

    let user = match (&credentials.email, &credentials.username) {
      (Some(email), _) => users::table
        .filter(users::email.eq(&email))
        .first::<User>(&mut conn)
        .map_err(|err| {
          log::error!("Failed to find user: {}", err);
          // todo @codyduong, do we want to expose a proper response like not found?
          ServiceError::InternalServerError
        })?,
      (_, Some(username)) => users::table
        .filter(users::username.eq(&username))
        .first::<User>(&mut conn)
        .map_err(|err| {
          log::error!("Failed to find user: {}", err);
          // todo @codyduong, do we want to expose a proper response like not found?
          ServiceError::InternalServerError
        })?,
      (None, None) => {
        log::error!("Missing required field: `email` or `password`");
        Err(ServiceError::BadRequest(
          "Missing required field: `email` or `password`".to_string(),
        ))?
      }
    };

    let perms = get_permissions(&mut conn, user.id).map_err(|err| {
      log::error!("Failed to get permissions: {}", err);
      ServiceError::InternalServerError
    })?;

    Ok((user, perms, credentials))
  })
  .await?;

  let (user, perms, credentials) = users_maybe?;

  match verify(&credentials.password, &user.password_hash) {
    Ok(_) => {
      let token = super::create_jwt()
        .user_id(user.id)
        .permissions(perms)
        .email(user.email)
        .username(user.username)
        .call()
        .map_err(|_| ServiceError::InternalServerError)?;
      Ok(HttpResponse::Ok().json(LoginResponse { token }))
    }
    Err(e) => {
      log::error!("Failed to login: {}", e);
      Err(ServiceError::Unauthorized.into())
    }
  }
}

#[derive(Deserialize, ToSchema)]
#[schema(description = "Login request. Either `email` or `username` must be provided.")]
pub struct LoginRequest {
  pub email: Option<String>,
  pub username: Option<String>,
  password: String,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
  pub token: String,
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = String, example = json!("Allow: OPTIONS, POST"))
  ),
)]
#[options("/login")]
pub async fn options_login() -> Result<HttpResponse, actix_web::Error> {
  Ok(
    HttpResponse::Ok()
      .append_header(("Allow", "OPTIONS, POST"))
      .append_header(("Accept", "application/json"))
      .append_header(("Content-Type", "application/json"))
      .finish(),
  )
}
