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
*/

use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
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
  let user = users::table
    .filter(users::username.eq(&credentials.username))
    .first::<User>(&mut conn)
    .map_err(|err| {
      log::error!("Failed to find user: {}", err);
      ServiceError::InternalServerError
    })?;

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
      let token = super::create_jwt(user.id, perms).map_err(|_| ServiceError::InternalServerError)?;
      Ok(HttpResponse::Ok().json(LoginResponse { token }))
    }
    Err(e) => {
      log::error!("Failed to login: {}", e);
      Err(ServiceError::Unauthorized.into())
    }
  }
}

#[derive(Deserialize, ToSchema)]
pub struct LoginRequest {
  username: String,
  password: String,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
  token: String,
}
