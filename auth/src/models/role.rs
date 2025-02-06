use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Identifiable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Role {
  pub id: i32,
  pub name: String,
}

#[derive(Queryable, Selectable, Associations, Debug, Serialize, Deserialize)]
#[diesel(belongs_to(crate::models::Permission))]
#[diesel(belongs_to(Role))]
#[diesel(table_name = crate::schema::roles_to_permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RoleToPermission {
  pub role_id: i32,
  pub permission_id: i32,
}
