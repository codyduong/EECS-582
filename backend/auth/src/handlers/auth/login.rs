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
*/

use crate::errors::ServiceError;
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
  let mut conn = db.get().unwrap();

  let user = match &credentials.email {
    Some(email) => users::table
      .filter(users::email.eq(&email))
      .first::<User>(&mut conn)
      .map_err(|err| {
        log::error!("Failed to find user: {}", err);
        ServiceError::InternalServerError
      })?,
    None => match &credentials.username {
      Some(username) => users::table
        .filter(users::username.eq(&username))
        .first::<User>(&mut conn)
        .map_err(|err| {
          log::error!("Failed to find user: {}", err);
          ServiceError::InternalServerError
        })?,
      None => {
        log::error!("Missing required field: `email` or `password`");
        Err(ServiceError::BadRequest(
          "Missing required field: `email` or `password`".to_string(),
        ))?
      }
    },
  };

  let perms: Vec<PermissionName> = users_to_roles::table
    .inner_join(roles::table.on(users_to_roles::role_id.eq(roles::id)))
    .inner_join(roles_to_permissions::table.on(roles::id.eq(roles_to_permissions::role_id)))
    .inner_join(permissions::table.on(roles_to_permissions::permission_id.eq(permissions::id)))
    .filter(users_to_roles::user_id.eq(user.id))
    .filter(users_to_roles::active.eq(true))
    .select(permissions::name)
    .distinct()
    .load::<PermissionName>(&mut conn)
    .map_err(|err| {
      log::error!("Failed to get permissions: {}", err);
      ServiceError::InternalServerError
    })?;

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
  email: Option<String>,
  username: Option<String>,
  password: String,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
  token: String,
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
