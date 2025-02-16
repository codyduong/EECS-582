/*
  Name: physical_marketplace.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-12 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-16 - Cody Duong - add comments

  Preconditions:
  - Diesel ORM must be installed and properly configured.
  - PostgreSQL must be used as the database.
  - The `users_to_roles` table must exist in the database.
*/

use diesel::prelude::*;

#[derive(Queryable, Selectable, Debug)]
#[diesel(belongs_to(crate::models::Marketplace))]
#[diesel(table_name = crate::schema::physical_marketplaces)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PhysicalMarketplace {
  pub open_location_code: String,
  pub marketplace_id: i32,
  pub deleted: bool,
  pub created_at: chrono::NaiveDateTime,
}

pub type PhysicalMarketplaceResponse = PhysicalMarketplace;
