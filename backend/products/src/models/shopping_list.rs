/*
  Name: shopping_list.rs

  Description:
  Structural typing of database schema into Rust, leveraging Diesel proc-macros
  and generated types to ensure schemas are always matching

  Programmer: @codyduong
  Date Created: 2025-03-31
  Revision History:
  - 2025-03-31 - @codyduong - add shopping lists
*/

use bigdecimal::BigDecimal;
use chrono::NaiveDateTime;
use diesel::prelude::*;

#[derive(Queryable, Identifiable, Selectable, AsChangeset)]
#[diesel(table_name = crate::schema::shopping_list)]
pub struct ShoppingList {
  pub id: i32,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

#[derive(Queryable, Identifiable, Selectable, AsChangeset, Associations)]
#[diesel(table_name = crate::schema::shopping_list_items)]
#[diesel(belongs_to(ShoppingList, foreign_key = shopping_list_id))]
#[diesel(primary_key(shopping_list_id, gtin))]
pub struct ShoppingListItem {
  pub shopping_list_id: i32,
  pub gtin: String,
  pub amount: BigDecimal,
  pub unit_id: Option<i32>,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

#[derive(Queryable, Identifiable, Selectable, Associations)]
#[diesel(table_name = crate::schema::shopping_list_to_user)]
#[diesel(belongs_to(ShoppingList, foreign_key = shopping_list_id))]
#[diesel(primary_key(shopping_list_id, user_id))]
pub struct ShoppingListToUser {
  pub shopping_list_id: i32,
  pub user_id: i32,
}

// Insertable structs for creating new records
#[derive(Insertable)]
#[diesel(table_name = crate::schema::shopping_list)]
pub struct NewShoppingList {
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::shopping_list_items)]
pub struct NewShoppingListItem {
  pub shopping_list_id: i32,
  pub gtin: String,
  pub amount: BigDecimal,
  pub unit_id: Option<i32>,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::shopping_list_to_user)]
pub struct NewShoppingListToUser {
  pub shopping_list_id: i32,
  pub user_id: i32,
}
