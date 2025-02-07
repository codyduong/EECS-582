pub mod errors;
pub mod handlers;
pub mod models;
pub mod schema;
pub type Pool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::PgConnection>>;
pub mod seed;
pub mod validator;
