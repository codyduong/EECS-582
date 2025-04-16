use diesel::prelude::*;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Queryable, Selectable, Debug, ToSchema, Serialize, Clone)]
#[diesel(table_name = crate::schema::companies)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Company {
  pub id: i32,
  pub name: String,
}

pub type CompanyResponse = Company;
