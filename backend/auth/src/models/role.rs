use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Identifiable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Role {
  pub id: i32,
  pub name: String,
}

pub type RoleResponse = Role;
