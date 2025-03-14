/*
  Name: seed.rs

  Description:
  This file seeds database with test data, only in development environments

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add seed.rs
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `permissions` table must exist in the database.

  Side Effects:
  - This script modifies the local database.
*/

use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use auth::TEST_USERNAME;
use diesel::dsl::*;
use diesel::query_dsl::methods::FilterDsl;
use diesel::ExpressionMethods;
use diesel::{insert_into, prelude::*};

pub(super) fn run(pool: crate::Pool) {
  let mut conn = pool.get().unwrap();

  let _ = delete(users::table)
    .filter(users::username.eq(TEST_USERNAME))
    .execute(&mut conn);

  #[cfg(debug_assertions)]
  let seed = true;
  #[cfg(not(debug_assertions))]
  let seed = std::env::var("SEED").is_ok();

  if seed {
    log::debug!("Seeding development environment data");

    // ensure we either add the user entirely, or don't at all
    match conn.transaction(|conn| {
      let test_user = NewUser {
        username: TEST_USERNAME,
        email: "test@example.com",
        password_hash: &bcrypt::hash(std::env::var("TEST_PASSWORD").unwrap_or("abc123".to_owned()), 10).unwrap(),
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
