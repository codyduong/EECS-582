/*
  Name: refresh.rs

  Description:
  The endpoint handler for `/api/v1/refresh`

  Programmer: Cody Duong
  Date Created: 2025-03-04
  Revision History:
  - 2025-03-04 - Cody Duong - add refresh route
*/

use super::decode_jwt_refresh;
use crate::errors::ServiceError;
use crate::handlers::auth::{create_jwt, get_permissions};
use crate::handlers::users::db_get_user_by_id;
use actix_web::http::header;
use actix_web::{post, web, HttpResponse};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use chrono::Utc;

// YOU MUST post to this endpoint with a refresh token as Bearer. Not with an access token
#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, headers(
      ("authorization" = String),
      ("x-refresh-token" = String),
    )),
  ),
  security(
    ("http" = [])
  )
)]
#[post("/refresh")]
pub(crate) async fn refresh_route(
  db: web::Data<crate::Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let token = auth.token().to_string();

  let claims = decode_jwt_refresh(&token).map_err(|e| {
    log::error!("Server error: {:?}", e);
    ServiceError::BadRequest("Invalid token".to_string())
  })?;

  // check that it is not expired, TODO consider using .iat instead that way we can change revocation times for
  // already issued tokens
  let expired = (Utc::now().timestamp() as usize) > claims.exp;
  if expired {
    return Err(ServiceError::Forbidden.into());
  }

  // any user can grant themselves a refresh token, -todo restrict based on create:token permission
  // - @codyduong
  let user_id = claims.sub;

  // rather than trust the claim to get permissions, instead regenerate permissions...
  // TODO, it should restrict to the same request or less, otherwise if a user attempts more permissions
  // than originally issued, it should simply return Forbidden, -@codyduong
  let perms = {
    let db = db.clone();
    web::block(move || {
      let mut conn = db.get().unwrap();

      Ok(get_permissions(&mut conn, user_id).map_err(|err| {
        log::error!("Failed to get permissions: {}", err);
        ServiceError::InternalServerError
      }))?
    })
    .await??
  };

  let user = web::block(move || db_get_user_by_id(db, user_id)).await?.map_err(|e| {
    log::debug!("Server error: {:?}", e);
    ServiceError::InternalServerError
  })?;

  let jwt = create_jwt()
    .email(user.email)
    .username(user.username)
    .user_id(user_id)
    .permissions(perms)
    .call()
    .map_err(|e| {
      log::debug!("Server error: {:?}", e);
      ServiceError::InternalServerError
    })?;

  let mut res = HttpResponse::Ok();

  let (access_token, refresh_token) = jwt;

  res.append_header((header::AUTHORIZATION, format!("Bearer {}", access_token)));
  if let Some(refresh_token) = refresh_token {
    res.append_header(("x-refresh-token", refresh_token));
  }

  Ok(res.finish())
}
