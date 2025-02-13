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
