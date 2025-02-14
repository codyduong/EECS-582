/*
  Name: permissions.rs

  Description:
  This Rust module defines an enumeration (`PermissionName`) representing different permission 
  levels, along with database integration using Diesel ORM. It also provides implementations for 
  serialization, deserialization, and SQL conversion.

  Programmer: Cody Duong
  Date Created: 2/10/25

  Revision History:
  - 2/10/25 - Cody Duong - Initial implementation of `PermissionName` enum and Diesel integration.
  - 2/114/25 - Harrison Wendt - Added new permissions for marketplace, price reports, and products.


  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `permissions` table must exist in the database.

  Acceptable Inputs:
  - Strings that match the predefined permission names.
  - Queries executed through Diesel ORM.

  Unacceptable Inputs:
  - Unknown permission names, which will cause deserialization errors.

  Postconditions:
  - Permission names are correctly converted to and from SQL values.
  - Data integrity is maintained in the database.

  Return Values:
  - Converts between Rust enums and database text values.
  - Returns valid `PermissionName` instances or an error on failure.

  Error and Exception Conditions:
  - If an unknown permission name is encountered, deserialization will fail.
  - Database errors may occur if the table structure is incorrect.

  Side Effects:
  - This module interacts with the database, potentially causing side effects 
    if migrations are not properly handled.

  Invariants:
  - The permission names must remain unique and correctly mapped to SQL text values.

  Known Faults:
  - Adding new permissions requires updating `ToSql` and `FromSql` manually 
    unless procedural macros are implemented.
*/


use diesel::{
  deserialize::{self, FromSql, FromSqlRow},
  pg::{Pg, PgValue},
  prelude::*,
  serialize::{self, IsNull, Output, ToSql},
};
use serde::{Deserialize, Serialize};
use std::io::Write;
use utoipa::{schema, ToSchema};

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

   // New marketplace permissions (2/14/24, Harrison Wendt)
   #[serde(rename = "create:marketplace")]
   #[schema(rename = "create:marketplace")]
   CreateMarketplace,
   #[serde(rename = "read:marketplace")]
   #[schema(rename = "read:marketplace")]
   ReadMarketplace,
   #[serde(rename = "update:marketplace")]
   #[schema(rename = "update:marketplace")]
   UpdateMarketplace,
   #[serde(rename = "delete:marketplace")]
   #[schema(rename = "delete:marketplace")]
   DeleteMarketplace,

   // New price report permissions (2/14/24, Harrison Wendt)
   #[serde(rename = "create:price_report")]
   #[schema(rename = "create:price_report")]
   CreatePriceReport,
   #[serde(rename = "read:price_report")]
   #[schema(rename = "read:price_report")]
   ReadPriceReport,
   #[serde(rename = "update:price_report")]
   #[schema(rename = "update:price_report")]
   UpdatePriceReport,
   #[serde(rename = "delete:price_report")]
   #[schema(rename = "delete:price_report")]
   DeletePriceReport, 

    // New price report permissions (2/14/24, Harrison Wendt)
    #[serde(rename = "create:product")]
    #[schema(rename = "create:product")]
    CreateProduct,
    #[serde(rename = "read:product")]
    #[schema(rename = "read:product")]
    ReadProduct,
    #[serde(rename = "update:product")]
    #[schema(rename = "update:product")]
    UpdateProduct,
    #[serde(rename = "delete:product")]
    #[schema(rename = "delete:product")]
    DeleteProduct, 
   
   
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


      //updating function to include product, marketplace, and price_report
      //2/14/24, Harrison Wendt
      PermissionName::CreateProduct => out.write_all(b"create:product")?,
      PermissionName::ReadProduct => out.write_all(b"read:product")?,
      PermissionName::UpdateProduct => out.write_all(b"update:product")?,
      PermissionName::DeleteProduct => out.write_all(b"delete:product")?,

      PermissionName::CreateMarketplace => out.write_all(b"create:marketplace")?,
      PermissionName::ReadMarketplace => out.write_all(b"read:marketplace")?,
      PermissionName::UpdateMarketplace => out.write_all(b"update:marketplace")?,
      PermissionName::DeleteMarketplace => out.write_all(b"delete:marketplace")?,

      PermissionName::CreatePriceReport => out.write_all(b"create:price_report")?,
      PermissionName::ReadPriceReport => out.write_all(b"read:price_report")?,
      PermissionName::UpdatePriceReport => out.write_all(b"update:price_report")?,
      PermissionName::DeletePriceReport => out.write_all(b"delete:price_report")?,
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

      //updating function to include product, marketplace, and price_report
      //2/14/24, Harrison Wendt
      b"create:product" => Ok(PermissionName::CreateProduct),
      b"read:product" => Ok(PermissionName::ReadProduct),
      b"update:product" => Ok(PermissionName::UpdateProduct),
      b"delete:product" => Ok(PermissionName::DeleteProduct),

      b"create:marketplace" => Ok(PermissionName::CreateMarketplace),
      b"read:marketplace" => Ok(PermissionName::ReadMarketplace),
      b"update:marketplace" => Ok(PermissionName::UpdateMarketplace),
      b"delete:marketplace" => Ok(PermissionName::DeleteMarketplace),

      b"create:price_report" => Ok(PermissionName::CreatePriceReport),
      b"read:price_report" => Ok(PermissionName::ReadPriceReport),
      b"update:price_report" => Ok(PermissionName::UpdatePriceReport),
      b"delete:price_report" => Ok(PermissionName::DeletePriceReport),
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

pub type PermissionResponse = Permission;
