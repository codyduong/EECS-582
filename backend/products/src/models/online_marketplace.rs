use diesel::prelude::*;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, ToSchema, Serialize)]
#[diesel(belongs_to(crate::models::Marketplace))]
#[diesel(table_name = crate::schema::online_marketplaces)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct OnlineMarketplace {
  pub id: i32,
  pub uri: String,
}

pub type OnlineMarketplaceResponse = OnlineMarketplace;
