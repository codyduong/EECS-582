use crate::models::PermissionName;
use crate::validator::ValidatorBuilder;
use actix_web::web;
use actix_web::web::ServiceConfig;

mod get_user;
use actix_web_httpauth::middleware::HttpAuthentication;
pub use get_user::*;
mod get_users;
pub use get_users::*;

pub(crate) const V1_PATH: &str = "/api/v1/users";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    let read_user = HttpAuthentication::bearer(ValidatorBuilder::new().with_scope(PermissionName::ReadAll).build());
    config.service(
      web::scope(V1_PATH)
        .wrap(read_user)
        .service(get_user_route)
        .service(get_users_route),
    );
  }
}
