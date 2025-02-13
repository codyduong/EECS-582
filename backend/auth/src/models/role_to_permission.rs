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
