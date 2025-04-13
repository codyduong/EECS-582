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
  - 2025-02-25 - @codyduong - add more key/values to claims
  - 2025-02-26 - @codyduong - lift `get_permissions` utility function from `login.rs` to here
                              make username nullable
  - 2025-02-26 - @codyduong - make claims more strict, add some initial groundwork for JWT refresh tokens
  - 2025-03-04 - Cody Duong - add refresh route
  - 2025-04-13 - @codyduong - refactor
*/

use actix_web::web::{self, ServiceConfig};

mod login;
pub use login::*;
mod refresh;
pub use refresh::*;
mod register;
pub use register::*;

pub(crate) const V1_PATH: &str = "/api/v1/auth";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(
      web::scope(V1_PATH)
        .service(login_route)
        .service(register_route)
        .service(refresh_route),
    );
  }
}
