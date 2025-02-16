/*
  Name: lib.rs

  Description:
  Exports select modules to rest of crate as public interface

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-05 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
*/

pub mod errors;
pub mod handlers;
pub mod models;
pub mod schema;
pub mod validator;
pub type Pool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::PgConnection>>;
pub const MIGRATIONS: diesel_migrations::EmbeddedMigrations = diesel_migrations::embed_migrations!("./migrations/");
pub const TEST_USERNAME: &str = "test";
pub const RESERVED_TEST_USERNAMES: [&str; 2] = [TEST_USERNAME, "admin"];
