/*
  Name: role_to_permission.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-05 - Cody Duong - initial creation of `RoleToPermission` struct
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `role_to_permissions` table must exist in the database.
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Associations, Debug, Serialize, Deserialize)]
#[diesel(belongs_to(super::Permission))]
#[diesel(belongs_to(super::Role))]
#[diesel(table_name = crate::schema::roles_to_permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RoleToPermission {
  pub role_id: i32,
  pub permission_id: i32,
}

#[allow(dead_code)]
pub type RoleToPermissionResponse = RoleToPermission;
