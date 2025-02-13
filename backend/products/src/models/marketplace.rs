use diesel::prelude::*;

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = crate::schema::marketplaces)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Marketplace {
  pub id: i32,
  pub name: String,
}

pub type MarketplaceResponse = Marketplace;
