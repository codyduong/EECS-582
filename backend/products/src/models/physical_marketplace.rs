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
