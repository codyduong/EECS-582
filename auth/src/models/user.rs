use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Identifiable, Selectable, Debug, Serialize, Deserialize, ToSchema)]
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

#[derive(Queryable, Selectable, Associations, Debug, Serialize, Deserialize)]
#[diesel(belongs_to(crate::models::Role))]
#[diesel(belongs_to(User))]
#[diesel(table_name = crate::schema::users_to_roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct UserToRole {
  pub user_id: i32,
  pub role_id: i32,
  pub created_at: chrono::NaiveDateTime,
  pub active: bool,
}
