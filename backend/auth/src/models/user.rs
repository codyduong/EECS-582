/*
  Name: user.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-12 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-05 - Cody Duong - add authentication (ie. password)
  - 2025-02-07 - Cody Duong - dom't expose password hash as part of public interface
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-12 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `users_to_roles` table must exist in the database.
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Identifiable, Selectable, Debug)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
  pub id: i32,
  pub email: String,
  pub created_at: chrono::NaiveDateTime,
  pub deleted: bool,
  pub deleted_at: Option<chrono::NaiveDateTime>,
  pub password_hash: String,
  pub username: String,
}

#[derive(Serialize, ToSchema)]
pub struct UserResponse {
  pub id: i32,
  pub email: String,
  pub created_at: chrono::NaiveDateTime,
  pub deleted: bool,
  pub deleted_at: Option<chrono::NaiveDateTime>,
  pub username: String,
}

impl From<User> for UserResponse {
  fn from(user: User) -> Self {
    Self {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      deleted: user.deleted,
      deleted_at: user.deleted_at,
      username: user.username,
    }
  }
}

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser<'a> {
  pub username: &'a str,
  pub email: &'a str,
  pub password_hash: &'a str,
}
