/*
  Name: mod.rs

  Description:
  Exports select modules to rest of crate as public interface. This also
  is a common endpoint to configure the actix-web interface from, with the
  configures function

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
*/

use crate::models::PermissionName;
use crate::validator::ValidatorBuilder;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web_httpauth::middleware::HttpAuthentication;

mod get_user;
pub use get_user::*;
mod get_users;
pub use get_users::*;

pub(crate) const V1_PATH: &str = "/api/v1/users";

/// Bind to actix-web ServiceConfig to attach this endpoint
pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    #[allow(deprecated)]
    let read_user = HttpAuthentication::bearer(ValidatorBuilder::new().with_scope(PermissionName::ReadAll).build());
    config.service(
      web::scope(V1_PATH)
        .wrap(read_user)
        .service(get_user_route)
        .service(get_users_route),
    );
  }
}
