/*
  Name: unit.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-14 - Cody Duong - add products POSTs/GETs merged with units
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `units` table must exist in the database.
*/

use derive_more::Display;
use diesel::{
  deserialize::{self, FromSql, FromSqlRow},
  pg::{Pg, PgValue},
  serialize::{self, IsNull, Output, ToSql},
  Queryable, Selectable,
};
use serde::{Deserialize, Serialize};
use std::io::Write;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, PartialEq, FromSqlRow, Clone, ToSchema, Hash, Eq, Display)]
pub enum UnitSymbol {
  #[serde(rename = "fl oz")]
  #[schema(rename = "fl oz")]
  FluidOunce,
  #[serde(rename = "oz")]
  #[schema(rename = "oz")]
  Ounce,
  #[serde(rename = "mL")]
  #[schema(rename = "mL")]
  Milliliter,
  #[serde(rename = "g")]
  #[schema(rename = "g")]
  Gram,
}

impl ToSql<diesel::sql_types::Text, Pg> for UnitSymbol {
  fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, Pg>) -> serialize::Result {
    match *self {
      UnitSymbol::FluidOunce => out.write_all(b"fl oz")?,
      UnitSymbol::Ounce => out.write_all(b"oz")?,
      UnitSymbol::Milliliter => out.write_all(b"mL")?,
      UnitSymbol::Gram => out.write_all(b"g")?,
    }
    Ok(IsNull::No)
  }
}

impl FromSql<diesel::sql_types::Text, Pg> for UnitSymbol {
  fn from_sql(bytes: PgValue<'_>) -> deserialize::Result<Self> {
    match bytes.as_bytes() {
      b"fl oz" => Ok(UnitSymbol::FluidOunce),
      b"oz" => Ok(UnitSymbol::Ounce),
      b"mL" => Ok(UnitSymbol::Milliliter),
      b"g" => Ok(UnitSymbol::Gram),
      _ => Err("Unrecognized enum variant".into()),
    }
  }
}

#[derive(Queryable, Selectable, Debug, Deserialize, Serialize, ToSchema, PartialEq, Hash, Clone)]
#[diesel(belongs_to(crate::models::Unit))]
#[diesel(table_name = crate::schema::units)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Unit {
  pub id: i32,
  pub symbol: UnitSymbol,
}

pub type UnitResponse = Unit;
