use self::models::*;
use actix_web::{
  web::{self, Data},
  App, HttpServer,
};
use diesel::{
  prelude::*,
  r2d2::{self, ConnectionManager},
};
use auth::*;
use utoipa::OpenApi;
use utoipa_swagger_ui::{SwaggerUi, Url};

mod errors;
mod handlers;

pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  use self::schema::users::dsl::*;

  let connection = &mut establish_connection();
  let results = users
    .select(User::as_select())
    .load(connection)
    .expect("Error loading users");

  println!("Displaying {} users", results.len());
  for user in results {
    println!("{:?}", user);
  }
  let _ = connection;

  std::env::set_var("RUST_LOG", "debug");
  env_logger::init();

  let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
  let manager = ConnectionManager::<PgConnection>::new(database_url);
  let pool: Pool = r2d2::Pool::builder().build(manager).expect("Failed to create pool.");

  #[derive(OpenApi)]
  #[openapi(paths(handlers::get_users))]
  struct ApiDoc;

  HttpServer::new(move || {
    App::new()
      .app_data(Data::new(pool.clone()))
      .service(web::scope("/api/v1").service(handlers::get_users))
      .service(
        SwaggerUi::new("/swagger-ui/{_:.*}")
          .urls(vec![(Url::new("api", "/api-docs/openapi.json"), ApiDoc::openapi())]),
      )
    // .route("/users/{id}", web::get().to(handlers::get_user_by_id))
  })
  .bind("127.0.0.1:8080")?
  .run()
  .await
}
