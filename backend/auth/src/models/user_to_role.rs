/*
  Name: user_to_role.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-12
  Revision History:
  - 2025-02-12 - Cody Duong - initial creation of `UserToRole` struct
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `users_to_roles` table must exist in the database.
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Associations, Debug, Serialize, Deserialize)]
#[diesel(belongs_to(super::Role))]
#[diesel(belongs_to(super::User))]
#[diesel(table_name = crate::schema::users_to_roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct UserToRole {
  pub user_id: i32,
  pub role_id: i32,
  pub created_at: chrono::NaiveDateTime,
  pub active: bool,
}

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users_to_roles)]
pub struct NewUserToRole {
  pub user_id: i32,
  pub role_id: i32,
  pub active: Option<bool>,
}
