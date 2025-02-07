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

#[derive(Serialize, ToSchema)]
pub struct UserResponse {
  pub id: i32,
  pub email: String,
  pub created_at: chrono::NaiveDateTime,
  pub deleted: bool,
  pub deleted_at: Option<chrono::NaiveDateTime>,
  pub username: String,
}

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser<'a> {
  pub username: &'a str,
  pub email: &'a str,
  pub password_hash: &'a str,
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

#[derive(Deserialize, Insertable)]
#[diesel(table_name = crate::schema::users_to_roles)]
pub struct NewUserToRole {
  pub user_id: i32,
  pub role_id: i32,
  pub active: Option<bool>,
}
