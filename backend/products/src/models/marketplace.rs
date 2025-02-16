/*
  Name: marketplace.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-12 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-12 - Cody Duong - add `NewMarketplace` to handle POSTs
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `marketplaces` table must exist in the database.
*/

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, ToSchema, Serialize)]
#[diesel(table_name = crate::schema::marketplaces)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Marketplace {
  pub id: i32,
  pub name: String,
}

pub type MarketplaceResponse = Marketplace;

#[derive(Deserialize, Insertable, ToSchema, Clone, Debug)]
#[diesel(table_name = crate::schema::marketplaces)]
pub struct NewMarketplace {
  pub name: String,
}
