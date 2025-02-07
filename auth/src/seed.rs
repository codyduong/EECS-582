use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use diesel::dsl::*;
use diesel::query_dsl::methods::FilterDsl;
use diesel::ExpressionMethods;
use diesel::{insert_into, prelude::*};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations/");
const TEST_USERNAME: &str = "test";
pub const RESERVED_TEST_USERNAMES: [&'static str; 2] = [TEST_USERNAME, "admin"];

pub fn run(pool: crate::Pool) {
  let mut conn = pool.get().unwrap();

  conn.run_pending_migrations(MIGRATIONS).unwrap();

  let _ = delete(users::table)
    .filter(users::username.eq(TEST_USERNAME))
    .execute(&mut conn);

  #[cfg(debug_assertions)]
  {
    log::debug!("Seeding development environment data");

    // ensure we either add the user entirely, or don't at all
    match conn.transaction(|conn| {
      let test_user = NewUser {
        username: TEST_USERNAME,
        email: "test@example.com",
        password_hash: &bcrypt::hash(std::env::var("TEST_PASSWORD").expect("TEST_PASSWORD should be set"), 10).unwrap(),
      };

      // if we are in dev seed with some data
      insert_into(users::table)
        .values(&test_user)
        .execute(conn)
        .map_err(|err| {
          log::error!("Failed to inset user: {}", err);
          ServiceError::InternalServerError
        })
        .unwrap();

      let test_user = FilterDsl::filter(users::table, users::username.eq(TEST_USERNAME))
        .first::<User>(conn)
        .unwrap();
      let admin_role = FilterDsl::filter(roles::table, roles::name.eq("admin"))
        .first::<Role>(conn)
        .unwrap();

      let test_user_roles = NewUserToRole {
        user_id: test_user.id,
        role_id: admin_role.id,
        active: None,
      };

      insert_into(users_to_roles::table)
        .values(test_user_roles)
        .execute(conn)
        .unwrap();

      diesel::result::QueryResult::Ok(())
    }) {
      Ok(_) => (),
      Err(err) => {
        log::error!("Failed to create test user: {}", err);
      }
    };
  }
}
