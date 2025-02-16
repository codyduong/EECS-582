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
*/

use crate::models::PermissionName;
use actix_web::web::{self, ServiceConfig};
use chrono::{Duration, Utc};
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
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  pub sub: i32,   // subject: user id
  pub exp: usize, // expiration time
  pub permissions: Vec<PermissionName>,
}

pub(crate) fn create_jwt(
  user_id: i32,
  permissions: Vec<PermissionName>,
) -> Result<String, jsonwebtoken::errors::Error> {
  let secret_key = std::env::var("SECRET_KEY").expect("SECRET_KEY must be set");

  let expiration = Utc::now()
    .checked_add_signed(Duration::hours(24))
    .expect("valid timestamp")
    .timestamp();

  let claims = Claims {
    sub: user_id,
    exp: expiration as usize,
    permissions,
  };

  encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(secret_key.as_ref()),
  )
}

pub fn decode_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
  let secret_key = std::env::var("SECRET_KEY").expect("SECRET_KEY must be set");

  decode::<Claims>(
    token,
    &DecodingKey::from_secret(secret_key.as_ref()),
    &Validation::new(Algorithm::HS256),
  )
  .map(|data| data.claims)
}

// pub async fn validator(
//   req: ServiceRequest,
//   credentials: BearerAuth,
// ) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
//   let secret_key = std::env::var("SECRET_KEY").expect("SECRET_KEY must be set");

//   let token = credentials.token();
//   match decode::<Claims>(
//     token,
//     &DecodingKey::from_secret(secret_key.as_ref()),
//     &Validation::new(Algorithm::HS256),
//   ) {
//     Ok(_) => Ok(req),
//     Err(_) => Err((actix_web::error::ErrorUnauthorized("Invalid token"), req)),
//   }
// }

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope(V1_PATH).service(login_route).service(register_route));
  }
}
