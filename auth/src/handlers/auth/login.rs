use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::users::username;
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
    .filter(username.eq(&credentials.username))
    .first::<User>(&mut conn)
    .map_err(|_| ServiceError::Unauthorized)?;

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

  if verify(&credentials.password, &user.password_hash).unwrap_or(false) {
    let token = super::create_jwt(user.id, perms).map_err(|_| ServiceError::InternalServerError)?;
    Ok(HttpResponse::Ok().json(LoginResponse { token }))
  } else {
    Err(ServiceError::Unauthorized.into())
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
