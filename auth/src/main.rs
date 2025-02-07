use actix_web::{web::Data, App, HttpServer};
use auth::handlers;
use diesel::{
  prelude::*,
  r2d2::{self, ConnectionManager},
};
use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};
use utoipa::{Modify, OpenApi};
use utoipa_swagger_ui::{SwaggerUi, Url};

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  dotenvy::dotenv().ok();
  simple_logger::SimpleLogger::new()
    .with_level(log::LevelFilter::Debug)
    .init()
    .unwrap();

  let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
  let manager = ConnectionManager::<PgConnection>::new(database_url);
  let pool: auth::Pool = r2d2::Pool::builder().build(manager).expect("Failed to create pool.");

  auth::seed::run(pool.clone());

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

  HttpServer::new(move || {
    App::new()
      .app_data(Data::new(pool.clone()))
      .configure(handlers::auth::configure())
      .configure(handlers::users::configure())
      .service(
        SwaggerUi::new("/swagger-ui/{_:.*}").urls(vec![(Url::new("api", "/api-docs/openapi.json"), ApiDoc::openapi())]),
      )
  })
  .bind("127.0.0.1:8080")?
  .run()
  .await
}
