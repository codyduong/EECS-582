use diesel::{
  deserialize::{self, FromSql, FromSqlRow},
  pg::{Pg, PgValue},
  prelude::*,
  serialize::{self, IsNull, Output, ToSql},
};
use serde::{Deserialize, Serialize};
use utoipa::{schema, ToSchema};
use std::io::Write;

#[derive(Debug, Serialize, Deserialize, PartialEq, FromSqlRow, Clone, ToSchema)]
pub enum PermissionName {
  #[serde(rename = "create:all")]
  #[schema(rename = "create:all")]
  CreateAll,
  #[serde(rename = "read:all")]
  #[schema(rename = "read:all")]
  ReadAll,
  #[serde(rename = "update:all")]
  #[schema(rename = "update:all")]
  UpdateAll,
  #[serde(rename = "delete:all")]
  #[schema(rename = "delete:all")]
  DeleteAll,
}

// todo im sure we can write a proc macro to impl this based on strum?
// LOL, as if this project wasn't complicated enough -- @codyduong
impl ToSql<diesel::sql_types::Text, Pg> for PermissionName {
  fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, Pg>) -> serialize::Result {
    match *self {
      PermissionName::CreateAll => out.write_all(b"create:all")?,
      PermissionName::ReadAll => out.write_all(b"read:all")?,
      PermissionName::UpdateAll => out.write_all(b"update:all")?,
      PermissionName::DeleteAll => out.write_all(b"delete:all")?,
    }
    Ok(IsNull::No)
  }
}

impl FromSql<diesel::sql_types::Text, Pg> for PermissionName {
  fn from_sql(bytes: PgValue<'_>) -> deserialize::Result<Self> {
    match bytes.as_bytes() {
      b"create:all" => Ok(PermissionName::CreateAll),
      b"read:all" => Ok(PermissionName::ReadAll),
      b"update:all" => Ok(PermissionName::UpdateAll),
      b"delete:all" => Ok(PermissionName::DeleteAll),
      _ => Err("Unrecognized enum variant".into()),
    }
  }
}

#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Permission {
  pub id: i32,
  pub name: PermissionName,
}
