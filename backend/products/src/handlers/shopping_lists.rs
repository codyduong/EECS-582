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
use actix_web::get;
use actix_web::patch;
use actix_web::post;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use auth::errors::ServiceError;
use diesel::dsl::insert_into;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::OptionalExtension;
use diesel::{QueryDsl, RunQueryDsl};
use serde::Deserialize;
use serde::Serialize;
use std::vec::Vec;
use utoipa::ToSchema;

pub(crate) const V1_PATH: &str = "/api/v1/shopping_lists";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(
      web::scope(V1_PATH)
        .service(create_shopping_list)
        .service(patch_shopping_list)
        .service(delete_shopping_list)
        .service(get_shopping_list)
        .service(get_shopping_lists),
    );
  }
}

#[derive(Deserialize, ToSchema)]
pub struct NewShoppingListRequest {
  pub user_ids: Option<Vec<i32>>,
  pub items: Vec<ShoppingListItemRequest>,
  pub name: Option<String>,
}

#[derive(Deserialize, ToSchema)]
pub struct ShoppingListItemRequest {
  pub gtin: String,
  #[schema(value_type = f64)]
  pub amount: bigdecimal::BigDecimal,
  pub unit_id: Option<i32>,
}

#[derive(Serialize, ToSchema)]
pub struct ShoppingListResponse {
  pub list: ShoppingList,
  pub users: Vec<ShoppingListToUser>,
  pub items: Vec<ShoppingListItem>,
}

fn get_full_shopping_list(
  conn: &mut diesel::PgConnection,
  shopping_list_id: i32,
) -> Result<ShoppingListResponse, diesel::result::Error> {
  let list = shopping_list::table
    .find(shopping_list_id)
    .first::<ShoppingList>(conn)?;

  let users = shopping_list_to_user::table
    .filter(shopping_list_to_user::shopping_list_id.eq(shopping_list_id))
    .load::<ShoppingListToUser>(conn)?;

  let items = shopping_list_items::table
    .filter(shopping_list_items::shopping_list_id.eq(shopping_list_id))
    .load::<ShoppingListItem>(conn)?;

  Ok(ShoppingListResponse { list, users, items })
}

#[utoipa::path(
    context_path = V1_PATH,
    request_body = NewShoppingListRequest,
    responses(
        (status = 201, description = "Shopping list created", body = ShoppingListResponse),
        (status = 400, description = "Bad request"),
        (status = 500, description = "Internal server error"),
    ),
)]
#[post("/")]
pub async fn create_shopping_list(
  data: web::Json<NewShoppingListRequest>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  let user_id = claims.sub;

  // Ensure the creator is included in the user_ids
  let mut user_ids = data.user_ids.clone().unwrap_or_default();
  if !user_ids.contains(&user_id) {
    user_ids.push(user_id);
  }

  let mut conn = db.get().map_err(|e| {
    log::error!("Error getting DB connection: {}", e);
    ServiceError::InternalServerError
  })?;

  let response = conn
    .transaction(|conn| {
      let new_shopping_list = NewShoppingList {
        name: data.name.clone(),
      };

      let shopping_list: ShoppingList = insert_into(shopping_list::table)
        .values(&new_shopping_list)
        .get_result(conn)?;

      // Bulk insert user associations
      let user_associations: Vec<NewShoppingListToUser> = user_ids
        .iter()
        .map(|user_id| NewShoppingListToUser {
          shopping_list_id: shopping_list.id,
          user_id: *user_id,
        })
        .collect();

      insert_into(shopping_list_to_user::table)
        .values(&user_associations)
        .execute(conn)?;

      // Bulk insert items
      let items: Vec<NewShoppingListItem> = data
        .items
        .iter()
        .map(|item| NewShoppingListItem {
          shopping_list_id: shopping_list.id,
          gtin: item.gtin.clone(),
          amount: item.amount.clone(),
          unit_id: item.unit_id,
          created_at: None,
          updated_at: None,
        })
        .collect();

      insert_into(shopping_list_items::table).values(&items).execute(conn)?;

      get_full_shopping_list(conn, shopping_list.id)
    })
    .map_err(|e| {
      log::error!("Transaction error: {}", e);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Created().json(response))
}

#[derive(Deserialize, ToSchema)]
#[serde(tag = "action")]
pub enum ItemPatchAction {
  #[serde(rename = "add")]
  Add(ShoppingListItemRequest),
  #[serde(rename = "remove")]
  Remove { gtin: String },
}

#[derive(Deserialize, ToSchema)]
pub struct PatchShoppingListRequest {
  pub items: Option<Vec<ItemPatchAction>>,
}

#[utoipa::path(
  context_path = V1_PATH,
  params(
      ("id", description = "Shopping list ID"),
  ),
  request_body = PatchShoppingListRequest,
  responses(
      (status = 200, description = "Shopping list updated", body = ShoppingListResponse),
      (status = 400, description = "Bad request"),
      (status = 403, description = "Forbidden - not owner of shopping list"),
      (status = 404, description = "Shopping list not found"),
      (status = 500, description = "Internal server error"),
  ),
)]
#[patch("/{id}")]
pub async fn patch_shopping_list(
  id: web::Path<i32>,
  data: web::Json<PatchShoppingListRequest>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  let user_id = claims.sub;
  let shopping_list_id = id.into_inner();

  let mut conn = db.get().map_err(|e| {
    log::error!("Error getting DB connection: {}", e);
    ServiceError::InternalServerError
  })?;

  // Verify user owns the shopping list
  let exists = shopping_list_to_user::table
    .filter(shopping_list_to_user::shopping_list_id.eq(shopping_list_id))
    .filter(shopping_list_to_user::user_id.eq(user_id))
    .first::<ShoppingListToUser>(&mut conn)
    .optional()
    .map_err(|e| {
      log::error!("Error checking ownership: {}", e);
      ServiceError::InternalServerError
    })?;

  if exists.is_none() {
    return Err(ServiceError::Forbidden.into());
  }

  let response = conn
    .transaction(|conn| {
      if let Some(item_actions) = &data.items {
        let now = chrono::Utc::now().naive_utc();

        for action in item_actions {
          match action {
            ItemPatchAction::Add(item) => {
              // Upsert item - update if exists, insert if new
              diesel::insert_into(shopping_list_items::table)
                .values(NewShoppingListItem {
                  shopping_list_id,
                  gtin: item.gtin.clone(),
                  amount: item.amount.clone(),
                  unit_id: item.unit_id,
                  created_at: None,
                  updated_at: None,
                })
                .on_conflict((shopping_list_items::shopping_list_id, shopping_list_items::gtin))
                .do_update()
                .set((
                  shopping_list_items::amount.eq(&item.amount),
                  shopping_list_items::unit_id.eq(item.unit_id),
                  shopping_list_items::updated_at.eq(now),
                ))
                .execute(conn)?;
            }
            ItemPatchAction::Remove { gtin } => {
              diesel::delete(
                shopping_list_items::table
                  .filter(shopping_list_items::shopping_list_id.eq(shopping_list_id))
                  .filter(shopping_list_items::gtin.eq(gtin)),
              )
              .execute(conn)?;
            }
          }
        }
      }

      // Update the shopping list's updated_at timestamp
      diesel::update(shopping_list::table.find(shopping_list_id))
        .set(shopping_list::updated_at.eq(chrono::Utc::now().naive_utc()))
        .execute(conn)?;

      get_full_shopping_list(conn, shopping_list_id)
    })
    .map_err(|e| {
      log::error!("Transaction error: {}", e);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Ok().json(response))
}

#[utoipa::path(
    context_path = V1_PATH,
    params(
        ("id", description = "Shopping list ID"),
    ),
    responses(
        (status = 200, description = "Shopping list deleted", body = ShoppingListResponse),
        (status = 403, description = "Forbidden - not owner of shopping list"),
        (status = 404, description = "Shopping list not found"),
        (status = 500, description = "Internal server error"),
    ),
)]
#[delete("/{id}")]
pub async fn delete_shopping_list(
  id: web::Path<i32>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  let user_id = claims.sub;
  let shopping_list_id = id.into_inner();

  let mut conn = db.get().map_err(|e| {
    log::error!("Error getting DB connection: {}", e);
    ServiceError::InternalServerError
  })?;

  // First get the full shopping list before deletion
  let response = get_full_shopping_list(&mut conn, shopping_list_id).map_err(|e| match e {
    diesel::result::Error::NotFound => ServiceError::NotFound(Some("Shopping list not found".to_string())),
    _ => {
      log::error!("Error fetching shopping list: {}", e);
      ServiceError::InternalServerError
    }
  })?;

  // Verify user owns the shopping list
  let exists = shopping_list_to_user::table
    .filter(shopping_list_to_user::shopping_list_id.eq(shopping_list_id))
    .filter(shopping_list_to_user::user_id.eq(user_id))
    .first::<ShoppingListToUser>(&mut conn)
    .optional()
    .map_err(|e| {
      log::error!("Error checking ownership: {}", e);
      ServiceError::InternalServerError
    })?;

  if exists.is_none() {
    return Err(ServiceError::Forbidden.into());
  }

  conn
    .transaction(|conn| {
      // Delete all associated records first
      diesel::delete(shopping_list_items::table.filter(shopping_list_items::shopping_list_id.eq(shopping_list_id)))
        .execute(conn)?;

      diesel::delete(shopping_list_to_user::table.filter(shopping_list_to_user::shopping_list_id.eq(shopping_list_id)))
        .execute(conn)?;

      // Finally delete the shopping list itself
      diesel::delete(shopping_list::table.find(shopping_list_id)).execute(conn)?;

      Ok::<_, diesel::result::Error>(())
    })
    .map_err(|e| {
      log::error!("Transaction error: {}", e);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Ok().json(response))
}

#[utoipa::path(
  context_path = V1_PATH,
  params(
      ("id", description = "Shopping list ID"),
  ),
  responses(
      (status = 200, description = "Shopping list details", body = ShoppingListResponse),
      (status = 403, description = "Forbidden - not owner of shopping list"),
      (status = 404, description = "Shopping list not found"),
      (status = 500, description = "Internal server error"),
  ),
)]
#[get("/{id}")]
pub async fn get_shopping_list(
  id: web::Path<i32>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  let user_id = claims.sub;
  let shopping_list_id = id.into_inner();

  let mut conn = db.get().map_err(|e| {
    log::error!("Error getting DB connection: {}", e);
    ServiceError::InternalServerError
  })?;

  // Verify user has access to the shopping list
  let exists = shopping_list_to_user::table
    .filter(shopping_list_to_user::shopping_list_id.eq(shopping_list_id))
    .filter(shopping_list_to_user::user_id.eq(user_id))
    .first::<ShoppingListToUser>(&mut conn)
    .optional()
    .map_err(|e| {
      log::error!("Error checking access: {}", e);
      ServiceError::InternalServerError
    })?;

  if exists.is_none() {
    return Err(ServiceError::Forbidden.into());
  }

  let response = get_full_shopping_list(&mut conn, shopping_list_id).map_err(|e| match e {
    diesel::result::Error::NotFound => ServiceError::NotFound(Some("Shopping list not found".to_string())),
    _ => {
      log::error!("Error fetching shopping list: {}", e);
      ServiceError::InternalServerError
    }
  })?;

  Ok(HttpResponse::Ok().json(response))
}

#[derive(Serialize, ToSchema)]
pub struct ShoppingListsResponse {
  pub lists: Vec<ShoppingListResponse>,
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
      (status = 200, description = "List of shopping lists belonging to user", body = ShoppingListsResponse),
      (status = 500, description = "Internal server error"),
  ),
)]
#[get("/")]
pub async fn get_shopping_lists(db: web::Data<Pool>, auth: BearerAuth) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  let user_id = claims.sub;

  let mut conn = db.get().map_err(|e| {
    log::error!("Error getting DB connection: {}", e);
    ServiceError::InternalServerError
  })?;

  let lists = conn
    .transaction(|conn| {
      // Get all shopping list IDs for this user
      let list_ids: Vec<i32> = shopping_list_to_user::table
        .filter(shopping_list_to_user::user_id.eq(user_id))
        .select(shopping_list_to_user::shopping_list_id)
        .load(conn)?;

      // Get full details for each shopping list
      let mut result = Vec::new();
      for list_id in list_ids {
        match get_full_shopping_list(conn, list_id) {
          Ok(details) => result.push(details),
          Err(e) => {
            log::warn!("Error fetching shopping list {}: {}", list_id, e);
            // Continue with other lists even if one fails
          }
        }
      }

      Ok::<_, diesel::result::Error>(result)
    })
    .map_err(|e| {
      log::error!("Transaction error: {}", e);
      ServiceError::InternalServerError
    })?;

  Ok(HttpResponse::Ok().json(ShoppingListsResponse { lists }))
}
