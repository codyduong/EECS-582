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
  - 2025-02-16 - Cody Duong - add comments
  - 2025-02-26 - @codyduong - make username nullable

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `users` table must exist in the database.
*/

use common_rs::to_rfc3339;
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
  pub username: Option<String>,
}

#[derive(Serialize, ToSchema, Clone)]
pub struct UserResponse {
  pub id: i32,
  pub email: String,
  pub username: Option<String>,
  #[serde(with = "to_rfc3339")]
  pub created_at: chrono::NaiveDateTime,
  // #[serde(with = "to_rfc3339")]
  // pub updated_at: chrono::NaiveDateTime,
  pub deleted: bool,
  #[serde(with = "to_rfc3339::option")]
  pub deleted_at: Option<chrono::NaiveDateTime>,
  #[schema(nullable, required = false)]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub roles: Option<Vec<super::Role>>,
  #[schema(nullable, required = false)]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub permissions: Option<Vec<super::Permission>>,
}

impl From<User> for UserResponse {
  fn from(user: User) -> Self {
    Self {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      // updated_at: user.updated_at,
      deleted: user.deleted,
      deleted_at: user.deleted_at,
      roles: None,
      permissions: None,
    }
  }
}

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser<'a> {
  pub username: Option<&'a str>,
  pub email: &'a str,
  pub password_hash: &'a str,
}
