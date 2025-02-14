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
