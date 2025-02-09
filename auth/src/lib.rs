pub mod errors;
pub mod handlers;
pub mod models;
pub mod schema;
pub mod validator;
pub type Pool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::PgConnection>>;
pub const MIGRATIONS: diesel_migrations::EmbeddedMigrations = diesel_migrations::embed_migrations!("./migrations/");
pub const TEST_USERNAME: &str = "test";
pub const RESERVED_TEST_USERNAMES: [&'static str; 2] = [TEST_USERNAME, "admin"];
