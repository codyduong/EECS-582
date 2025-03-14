/*
  Name: mod.rs

  Description:
  Exports select modules to rest of crate as public interface. This also
  is a common endpoint to configure the actix-web interface from, with the
  configures function. This file also contains some utility functions revolving
  around jsonwebtokens JWTs.

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
  - 2025-02-25 - @codyduong - add comment about concerns regarding JWT lifetimes
*/

use crate::models::*;
use crate::schema::*;
use actix_web::web::{self, ServiceConfig};
use bon::builder;
use bon::Builder;
use chrono::{Duration, Utc};
use diesel::prelude::*;
use diesel::r2d2::ConnectionManager;
use diesel::r2d2::PooledConnection;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

mod login;
pub use login::*;
mod register;
pub use register::*;

pub(crate) const V1_PATH: &str = "/api/v1/auth";

// IN PROD when you change claims it can invalidate old valid JWTs, todo
// we need to update handling of failed claims...? would be better devUX
// fuck the users though LOL! -- @codyduong

// todo @codyduong: don't make claims live forever... LMAO! implement JWT expiry
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  pub aud: Option<String>, // Audience
  pub exp: usize,          // Expiration (as UTC Timestamp)
  pub iat: usize,          // Issued at (as UTC Timestamp)
  pub iss: String,         // Issuer
  pub nbf: usize,          // Not before
  pub sub: i32,            // Subject (user id)

  // Custom claims
  pub permissions: Vec<PermissionName>,
  pub email: String,
  #[builder(required)]
  pub username: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Builder)]
pub struct RefreshClaims {
  pub aud: Option<String>, // Audience
  pub exp: usize,          // Expiration (as UTC Timestamp)
  pub iat: usize,          // Issued at (as UTC Timestamp)
  pub iss: String,         // Issuer
  pub nbf: usize,          // Not before
  pub sub: i32,            // Subject (user id)

  // Custom claims
  pub permissions: Vec<PermissionName>,
}

#[builder]
pub(crate) fn create_jwt(
  user_id: i32,
  permissions: Vec<PermissionName>,
  email: String,
  #[builder(required)] username: Option<String>,
) -> Result<(String, Option<String>), jsonwebtoken::errors::Error> {
  let secret_key = std::env::var("SECRET_KEY").expect("SECRET_KEY must be set");

  let exp = Utc::now()
    // THIS VALUE SHOULD NEVER BE >3600 MINUTES, otherwise you're doing something wrong with your access_tokens
    .checked_add_signed(Duration::minutes(60))
    .expect("valid timestamp")
    .timestamp();

  let iat = Utc::now().timestamp();

  let access_token = Claims::builder()
    .exp(exp as usize)
    .iat(iat as usize)
    .iss("auth".to_owned())
    .nbf(iat as usize)
    .sub(user_id)
    .permissions(permissions.clone())
    .email(email)
    .username(username)
    .build();

  let exp = Utc::now()
    // We should use iat as a mechanism instead for long-lived tokens, but TODO -@codyduong
    .checked_add_signed(Duration::days(7))
    .expect("valid timestamp")
    .timestamp();

  // TODO further work is needed to ensure stateful deletion of invalidated JWTs -@codyduong
  let refresh_token = RefreshClaims::builder()
    .exp(exp as usize)
    .iat(iat as usize)
    .iss("auth".to_owned())
    .nbf(iat as usize)
    .sub(user_id)
    .permissions(permissions)
    .build();

  Ok((
    encode(
      &Header::default(),
      &access_token,
      &EncodingKey::from_secret(secret_key.as_ref()),
    )?,
    Some(encode(
      &Header::default(),
      &refresh_token,
      &EncodingKey::from_secret(secret_key.as_ref()),
    )?),
  ))
}

pub fn decode_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
  let secret_key = std::env::var("SECRET_KEY").expect("SECRET_KEY must be set");

  let mut validation = Validation::new(Algorithm::HS256);
  validation.set_required_spec_claims(&["exp", "iat", "iss", "nbf", "sub", "email"]);
  validation.set_issuer(&["auth"]);

  decode::<Claims>(token, &DecodingKey::from_secret(secret_key.as_ref()), &validation).map(|data| data.claims)
}

pub fn get_permissions(
  conn: &mut PooledConnection<ConnectionManager<PgConnection>>,
  id: i32,
) -> Result<Vec<PermissionName>, diesel::result::Error> {
  users_to_roles::table
    .inner_join(roles::table.on(users_to_roles::role_id.eq(roles::id)))
    .inner_join(roles_to_permissions::table.on(roles::id.eq(roles_to_permissions::role_id)))
    .inner_join(permissions::table.on(roles_to_permissions::permission_id.eq(permissions::id)))
    .filter(users_to_roles::user_id.eq(id))
    .filter(users_to_roles::active.eq(true))
    .select(permissions::name)
    .distinct()
    .load::<PermissionName>(conn)
}

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope(V1_PATH).service(login_route).service(register_route));
  }
}
