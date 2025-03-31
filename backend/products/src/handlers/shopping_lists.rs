/*
  Name: shopping_lists.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: @codyduong
  Date Created: 2025-03-31
  Revision History:
  - 2025-03-31 - @codyduong - add shopping lists
*/

use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::delete;
use actix_web::post;
use actix_web::put;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use auth::errors::ServiceError;
use diesel::dsl::insert_into;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::{QueryDsl, RunQueryDsl};
use serde::Deserialize;
use std::vec::Vec;
use utoipa::ToSchema;

pub(crate) const V1_PATH: &str = "/api/v1/shopping_lists";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(
      web::scope(V1_PATH)
        .service(create_shopping_list)
        .service(update_shopping_list)
        .service(delete_shopping_list),
    );
  }
}

#[derive(Deserialize, ToSchema)]
pub struct NewShoppingListRequest {
  pub user_ids: Vec<i32>,
  pub items: Vec<ShoppingListItemRequest>,
}

#[derive(Deserialize, ToSchema)]
pub struct ShoppingListItemRequest {
  pub gtin: String,
  #[schema(value_type = f64)]
  pub amount: bigdecimal::BigDecimal,
  pub unit_id: Option<i32>,
}

#[derive(Deserialize, ToSchema)]
pub struct UpdateShoppingListRequest {
  pub user_ids: Option<Vec<i32>>,
  pub items: Option<Vec<ShoppingListItemRequest>>,
}

#[utoipa::path(
    context_path = V1_PATH,
    request_body = NewShoppingListRequest,
    responses(
        (status = 201, description = "Shopping list created"),
        (status = 400, description = "Bad request"),
        (status = 500, description = "Internal server error"),
    ),
)]
#[post("/")]
pub async fn create_shopping_list(
  data: web::Json<NewShoppingListRequest>,
  db: web::Data<Pool>,
  // auth: BearerAuth, // Uncomment if auth is needed
) -> Result<HttpResponse, actix_web::Error> {
  // let _claims = ValidatorBuilder::new().with_scope(PermissionName::Create).validate(&auth)?; // Uncomment if auth is needed

  let mut conn = db.get().map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  conn
    .transaction(|conn| {
      let now = chrono::Utc::now().naive_utc();
      let new_shopping_list = NewShoppingList {
        created_at: now,
        updated_at: now,
      };

      let shopping_list: ShoppingList = insert_into(shopping_list::table)
        .values(&new_shopping_list)
        .get_result(conn)?;

      for user_id in &data.user_ids {
        let new_user_association = NewShoppingListToUser {
          shopping_list_id: shopping_list.id,
          user_id: *user_id,
        };
        insert_into(shopping_list_to_user::table)
          .values(&new_user_association)
          .execute(conn)?;
      }

      for item in &data.items {
        let new_item = NewShoppingListItem {
          shopping_list_id: shopping_list.id,
          gtin: item.gtin.clone(),
          amount: item.amount.clone(),
          unit_id: item.unit_id,
          created_at: now,
          updated_at: now,
        };
        insert_into(shopping_list_items::table)
          .values(&new_item)
          .execute(conn)?;
      }

      Ok::<_, diesel::result::Error>(())
    })
    .map_err(|e| {
      log::error!("Error: {}", e);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Created().finish())
}

#[utoipa::path(
    context_path = V1_PATH,
    params(
        ("id", description = "Shopping list ID"),
    ),
    request_body = UpdateShoppingListRequest,
    responses(
        (status = 200, description = "Shopping list updated"),
        (status = 400, description = "Bad request"),
        (status = 404, description = "Shopping list not found"),
        (status = 500, description = "Internal server error"),
    ),
)]
#[put("/{id}")]
pub async fn update_shopping_list(
  id: web::Path<i32>,
  data: web::Json<UpdateShoppingListRequest>,
  db: web::Data<Pool>,
  // auth: BearerAuth, // Uncomment if auth is needed
) -> Result<HttpResponse, actix_web::Error> {
  // let _claims = ValidatorBuilder::new().with_scope(PermissionName::Update).validate(&auth)?; // Uncomment if auth is needed

  let mut conn = db.get().map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  let shopping_list_id = id.into_inner();

  conn
    .transaction(|conn| {
      if let Some(user_ids) = &data.user_ids {
        diesel::delete(
          shopping_list_to_user::table.filter(shopping_list_to_user::shopping_list_id.eq(shopping_list_id)),
        )
        .execute(conn)?;

        for user_id in user_ids {
          let new_user_association = NewShoppingListToUser {
            shopping_list_id,
            user_id: *user_id,
          };
          insert_into(shopping_list_to_user::table)
            .values(&new_user_association)
            .execute(conn)?;
        }
      }

      if let Some(items) = &data.items {
        diesel::delete(shopping_list_items::table.filter(shopping_list_items::shopping_list_id.eq(shopping_list_id)))
          .execute(conn)?;

        let now = chrono::Utc::now().naive_utc();
        for item in items {
          let new_item = NewShoppingListItem {
            shopping_list_id,
            gtin: item.gtin.clone(),
            amount: item.amount.clone(),
            unit_id: item.unit_id,
            created_at: now,
            updated_at: now,
          };
          insert_into(shopping_list_items::table)
            .values(&new_item)
            .execute(conn)?;
        }
      }

      Ok::<_, diesel::result::Error>(())
    })
    .map_err(|e| {
      log::error!("Error: {}", e);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Ok().finish())
}

#[utoipa::path(
    context_path = V1_PATH,
    params(
        ("id", description = "Shopping list ID"),
    ),
    responses(
        (status = 204, description = "Shopping list deleted"),
        (status = 404, description = "Shopping list not found"),
        (status = 500, description = "Internal server error"),
    ),
)]
#[delete("/{id}")]
pub async fn delete_shopping_list(
  id: web::Path<i32>,
  db: web::Data<Pool>,
  // auth: BearerAuth, // Uncomment if auth is needed
) -> Result<HttpResponse, actix_web::Error> {
  // let _claims = ValidatorBuilder::new().with_scope(PermissionName::Delete).validate(&auth)?; // Uncomment if auth is needed

  let mut conn = db.get().map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  let shopping_list_id = id.into_inner();

  diesel::delete(shopping_list::table.find(shopping_list_id))
    .execute(&mut conn)
    .map_err(|e| match e {
      diesel::result::Error::NotFound => ServiceError::NotFound(Some("Shopping list not found".to_string())),
      _ => ServiceError::InternalServerError,
    })?;

  Ok(HttpResponse::NoContent().finish())
}
