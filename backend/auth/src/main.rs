/*
  Name: main.rs

  Description:
  The primary entry file for running the auth microservice

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-05 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - reorganize imports
  - 2025-02-16 - Cody Duong - add comments
*/

use actix_web::{web::Data, App, HttpServer};
use auth::*;
use diesel::{
  prelude::*,
  r2d2::{self, ConnectionManager},
};
use diesel_migrations::MigrationHarness;
use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};
use utoipa::{Modify, OpenApi};
use utoipa_swagger_ui::{SwaggerUi, Url};

mod seed;

#[cfg(debug_assertions)]
const API_URL: &str = "127.0.0.1";
#[cfg(not(debug_assertions))]
const API_URL: &str = "0.0.0.0";

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  dotenvy::dotenv().ok();
  simple_logger::SimpleLogger::new()
    .with_level(log::LevelFilter::Debug)
    .env()
    .init()
    .unwrap();

  let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
  let api_port = std::env::var("PORT").unwrap_or_else(|_| {
    #[cfg(debug_assertions)]
    {
      log::debug!("Failed to find PORT in .env, falling back to: 8082");
      return "8082".to_string();
    }
    #[allow(unreachable_code)]
    "8082".to_string()
  });

  let manager = ConnectionManager::<PgConnection>::new(database_url);
  let pool = r2d2::Pool::builder().build(manager).expect("Failed to create pool.");

  let mut conn = pool.get().unwrap();
  conn.run_pending_migrations(MIGRATIONS).unwrap();

  seed::run(pool.clone());

  #[derive(OpenApi)]
  #[openapi(
    modifiers(&SecurityAddon),
    paths(
      handlers::auth::login_route,
      handlers::auth::register_route,
      handlers::users::get_user_route,
      handlers::users::get_users_route
    )
  )]
  struct ApiDoc;

  struct SecurityAddon;

  impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
      if let Some(components) = openapi.components.as_mut() {
        components.add_security_scheme(
          "http",
          SecurityScheme::Http(
            HttpBuilder::new()
              .scheme(HttpAuthScheme::Bearer)
              .bearer_format("JWT")
              .build(),
          ),
        )
      }
    }
  }

  let url = API_URL.to_owned() + ":" + &api_port;

  HttpServer::new(move || {
    App::new()
      .app_data(Data::new(pool.clone()))
      .configure(handlers::auth::configure())
      .configure(handlers::users::configure())
      .service(
        SwaggerUi::new("/swagger-ui/{_:.*}").urls(vec![(Url::new("api", "/api-docs/openapi.json"), ApiDoc::openapi())]),
      )
  })
  .bind(url)?
  .run()
  .await
}
