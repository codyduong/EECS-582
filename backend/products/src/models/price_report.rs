use common_rs::to_rfc3339;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, ToSchema, Serialize, Clone)]
#[diesel(table_name = crate::schema::price_reports)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PriceReport {
  pub id: i64,
  #[serde(with = "to_rfc3339")]
  pub reported_at: chrono::NaiveDateTime,
  #[serde(with = "to_rfc3339")]
  pub created_at: chrono::NaiveDateTime,
  #[serde(with = "to_rfc3339")]
  pub updated_at: chrono::NaiveDateTime,
  pub created_by: i32,
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  #[schema(value_type = f64)]
  pub price: bigdecimal::BigDecimal,
  #[schema(min_length = 3, max_length = 3)]
  pub currency: String,
}

#[derive(Serialize, ToSchema)]
pub struct PriceResponse {
  #[serde(flatten)]
  pub price_report: PriceReport,
  pub company: super::Company,
  pub marketplace: super::MarketplaceResponse,
}

#[derive(Deserialize, Insertable, ToSchema, Clone, Debug)]
#[diesel(table_name = crate::schema::price_reports)]
pub struct NewPriceReport {
  pub id: Option<i64>,
  pub reported_at: Option<chrono::NaiveDateTime>,
  pub created_by: i32,
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  #[schema(value_type = f64)]
  pub price: bigdecimal::BigDecimal,
  #[schema(min_length = 3, max_length = 3)]
  pub currency: String,
}

#[derive(Deserialize, Insertable, ToSchema, Clone, Debug)]
#[diesel(table_name = crate::schema::price_reports)]
pub struct NewPriceReportPublic {
  pub reported_at: Option<chrono::NaiveDateTime>,
  #[schema(min_length = 8, max_length = 14)]
  pub gtin: String,
  #[schema(value_type = f64)]
  pub price: bigdecimal::BigDecimal,
  #[schema(min_length = 3, max_length = 3)]
  pub currency: String,
}

impl NewPriceReportPublic {
  pub fn with_user(self, user_id: i32) -> NewPriceReport {
    NewPriceReport {
      id: None,
      reported_at: self.reported_at,
      created_by: user_id,
      gtin: self.gtin,
      price: self.price,
      currency: self.currency,
    }
  }
}

impl From<NewPriceReportDSL> for NewPriceReportPublic {
  fn from(value: NewPriceReportDSL) -> Self {
    value.price_report
  }
}

#[derive(Deserialize, Clone, Debug, ToSchema)]
pub struct NewPriceReportDSL {
  #[serde(flatten)]
  pub price_report: NewPriceReportPublic,
  pub marketplace_id: i32,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum NewPriceReportDSLUnion {
  Single(NewPriceReportDSL),
  Multiple(Vec<NewPriceReportDSL>),
}

impl From<NewPriceReportDSLUnion> for Vec<NewPriceReportDSL> {
  fn from(r: NewPriceReportDSLUnion) -> Self {
    match r {
      NewPriceReportDSLUnion::Single(single) => vec![single],
      NewPriceReportDSLUnion::Multiple(multiple) => multiple,
    }
  }
}
