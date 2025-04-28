/*
  Name: main.rs

  Description:
  The primary entry file for running the products microservice

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-05 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - move files
  - 2025-02-14 - Cody Duong - add product POST
  - 2025-02-14 - Cody Duong - add marketplace GET/POST
  - 2025-02-16 - Cody Duong - add comments
  - 2025-02-25 - @codyduong - add CORS
*/

use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use diesel::{
  prelude::*,
  r2d2::{self, ConnectionManager},
};
use diesel_migrations::MigrationHarness;
use products::*;
use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};
use utoipa::{Modify, OpenApi};
use utoipa_swagger_ui::{SwaggerUi, Url};

mod seed;

#[cfg(debug_assertions)]
const API_URL: &str = "127.0.0.1";
#[cfg(debug_assertions)]
const ALLOWED_ORIGINS: [&str; 1] = ["http://localhost:3000"];
#[cfg(not(debug_assertions))]
const API_URL: &str = "0.0.0.0";
#[cfg(not(debug_assertions))]
const ALLOWED_ORIGINS: [&str; 3] = ["http://localhost:3000", "https://grocerywise-web-999614162763.us-central1.run.app", "https://gateway-999614162763.us-central1.run.app/"];
const MIGRATIONS: diesel_migrations::EmbeddedMigrations = diesel_migrations::embed_migrations!("./migrations/");

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

  conn.revert_last_migration(MIGRATIONS).unwrap();
  conn.run_pending_migrations(MIGRATIONS).unwrap();

  seed::run(pool.clone());

  #[derive(OpenApi)]
  #[openapi(
    modifiers(&SecurityAddon),
    paths(
      handlers::companies::get_company,
      handlers::companies::get_companies,
      handlers::marketplaces::get_marketplace,
      handlers::marketplaces::get_marketplaces,
      handlers::marketplaces::post_marketplace,
      handlers::price_reports::get_price_reports_for_gtin,
      handlers::price_reports::get_price_reports_for_gtins,
      handlers::price_reports::post_price_report,
      handlers::products_to_images::get_image,
      handlers::products_to_images::post_image,
      handlers::products::get_product,
      handlers::products::delete_product,
      handlers::products::get_products,
      handlers::products::post_products,
      handlers::shopping_lists::create_shopping_list,
      handlers::shopping_lists::patch_shopping_list,
      handlers::shopping_lists::delete_shopping_list,
      handlers::shopping_lists::get_shopping_list,
      handlers::shopping_lists::get_shopping_lists,
      handlers::units::get_unit,
      handlers::units::get_units,
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
    let cors = Cors::default()
      .allowed_origin_fn(|origin, _req_head| ALLOWED_ORIGINS.iter().any(|&i| i == origin))
      .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
      .allowed_headers(vec!["Content-Type", "Authorization", "b3", "traceparent"])
      .max_age(3600);

    App::new()
      .wrap(Logger::default())
      .wrap(cors)
      .app_data(Data::new(pool.clone()))
      .configure(handlers::shopping_lists::configure())
      .configure(handlers::marketplaces::configure())
      .configure(handlers::products_to_images::configure())
      .configure(handlers::products::configure())
      .configure(handlers::units::configure())
      .configure(handlers::price_reports::configure())
      .configure(handlers::companies::configure())
      .service(
        SwaggerUi::new("/swagger-ui/{_:.*}").urls(vec![(Url::new("api", "/api-docs/openapi.json"), ApiDoc::openapi())]),
      )
  })
  .bind(url)?
  .run()
  .await
}
