pub mod handlers;
pub mod models;
pub mod schema;
pub type Pool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::PgConnection>>;
pub const MIGRATIONS: diesel_migrations::EmbeddedMigrations = diesel_migrations::embed_migrations!("./migrations/");
