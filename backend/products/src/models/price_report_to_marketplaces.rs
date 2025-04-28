use common_rs::to_rfc3339;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, ToSchema, Serialize, Insertable, Deserialize)]
#[diesel(table_name = crate::schema::price_report_to_marketplaces)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PriceReportToMarketplace {
  pub price_report_id: i64,
  #[serde(serialize_with = "to_rfc3339::serialize")]
  pub reported_at: chrono::NaiveDateTime,
  pub marketplace_id: i32,
}
