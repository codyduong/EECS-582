/*
  Name: products.rs

  Description:
  The endpoint handler for `/api/v1/marketplace/XXX`

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-08 - Cody Duong - init product endpoint
  - 2025-02-14 - Cody Duong - add product POST
  - 2025-02-16 - Cody Duong - add comments
  - 2025-03-28 - @codyduong - remove auth on some endpoints
  - 2025-03-28 - @codyduong - fix ordering
  - 2025-03-30 - @codyduong - add delete/edit
*/

use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::delete;
use actix_web::get;
use actix_web::post;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use anyhow::anyhow;
use auth::errors::ServiceError;
use auth::models::PermissionName;
use common_rs::graphql::GraphConnection;
use common_rs::graphql::Node;
use common_rs::graphql::PageInfo;
use common_rs::graphql::PaginationParams;
use diesel::dsl::insert_into;
use diesel::upsert::excluded;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::JoinOnDsl;
use diesel::SelectableHelper;
use diesel::{QueryDsl, RunQueryDsl};
use itertools::Itertools;
use serde::Deserialize;
use std::collections::HashMap;
use std::vec::Vec;
use validator_rs::ValidatorBuilder;

pub(crate) const V1_PATH: &str = "/api/v1/products";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(
      web::scope(V1_PATH)
        .service(get_product)
        .service(delete_product)
        .service(get_products)
        .service(post_products),
    );
  }
}

fn db_get_product_by_gtin(pool: web::Data<Pool>, gtin: String) -> anyhow::Result<ProductResponse> {
  let mut conn = pool.get()?;

  let result = products::table
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .left_join(products_to_images::table.on(products_to_images::gtin.eq(products::gtin)))
    .filter(products::gtin.eq(gtin))
    .load::<(Product, ProductToMeasure, Unit, Option<ProductToImage>)>(&mut conn)?;

  fold_products_and_measures(result)
    .first()
    .cloned()
    .ok_or_else(|| anyhow!("Failed to find product"))
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = ProductResponse),
    (status = 401),
  ),
  params(
    ("gtin" = String, Path, description = "Global Trade Item Number (gtin)")
  ),
  // security(
  //   ("http" = [])
  // )
)]
#[get("/{gtin}")]
pub(crate) async fn get_product(
  gtin: web::Path<String>,
  db: web::Data<Pool>,
  // _auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  // let _claims = ValidatorBuilder::new()
  //   .with_scope(PermissionName::ReadAll)
  //   .with_or(vec![ScopeRequirement::Scope(PermissionName::ReadProduct)])
  //   .validate(&auth)?;

  let result = {
    let gtin = gtin.clone();
    web::block(move || db_get_product_by_gtin(db, gtin)).await
  };

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(Into::<ProductResponse>::into(res))),
    Ok(Err(err)) => match err.downcast_ref::<diesel::result::Error>() {
      Some(diesel::result::Error::NotFound) => {
        log::warn!("Product not found {}", gtin);
        Ok(Err(ServiceError::NotFound(Some("Product not found".to_string())))?)
      }
      Some(_) => {
        log::error!("{}", err);
        Ok(Err(ServiceError::InternalServerError)?)
      }
      None => {
        log::error!("{}", err);
        Ok(Err(ServiceError::InternalServerError)?)
      }
    },
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}

#[derive(Debug, Deserialize)]
struct GetProductsParams {
  #[serde(flatten)]
  pagination_params: PaginationParams<chrono::NaiveDateTime>,
}

fn db_get_all_products(
  pool: web::Data<Pool>,
  options: GetProductsParams,
) -> anyhow::Result<GraphConnection<ProductResponse>> {
  let mut conn = pool.get()?;

  let mut query = products::table.into_boxed();
  let params = options.pagination_params;
  let id_column = products::updated_at;
  let cursor_fn = |x: &ProductResponse| x.product.gtin.to_string();

  // Validate pagination parameters
  if params.first.is_some() && params.last.is_some() {
    return Err(anyhow!("Can't have first and last pagination parameters"));
  }

  if params.after.is_some() && params.before.is_some() {
    return Err(anyhow!("Can't have after and before pagination parameters"));
  }

  let limit = params.first.or(params.last).unwrap_or(20).clamp(1, 100);
  let is_forward = params.first.is_some();

  match (is_forward, params.after, params.before) {
    // Forward pagination
    (true, after, None) => {
      if let Some(after_id) = after {
        query = query.filter(id_column.gt(after_id));
      }
      query = query.order(id_column.asc()).limit(limit as i64 + 1);
    }
    // Backward pagination
    (false, None, before) => {
      if let Some(before_id) = before {
        query = query.filter(id_column.lt(before_id));
      }
      query = query.order(id_column.desc()).limit(limit as i64 + 1);
    }
    _ => return Err(anyhow!("Failed to resolve pagination")),
  }

  let result = query
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .left_join(products_to_images::table.on(products_to_images::gtin.eq(products::gtin)))
    .order((products::gtin.asc(), products_to_images::id.asc()))
    .select((
      Product::as_select(),
      ProductToMeasure::as_select(),
      Unit::as_select(),
      Option::<ProductToImage>::as_select(),
    ))
    .load::<(Product, ProductToMeasure, Unit, Option<ProductToImage>)>(&mut conn)?;

  let mut product_respones = fold_products_and_measures(result);

  let has_additional = product_respones.len() as i64 > limit.into();
  if has_additional {
    product_respones.pop();
  }

  // Get cursors without cloning items
  let start_cursor = product_respones.first().map(cursor_fn);
  let end_cursor = product_respones.last().map(cursor_fn);

  // Determine page info
  let has_next_page = if is_forward {
    has_additional
  } else {
    params.before.is_some()
  };

  let has_previous_page = if is_forward {
    params.after.is_some()
  } else {
    has_additional
  };

  let edges = product_respones
    .into_iter()
    .map(|item| Node {
      cursor: cursor_fn(&item),
      node: item,
    })
    .collect();

  Ok(GraphConnection {
    edges,
    page_info: PageInfo {
      has_next_page,
      has_prev_page: has_previous_page,
      start_cursor,
      end_cursor,
    },
  })
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = GraphConnection<ProductResponse>),
    (status = 401),
  ),
  // security(
  //   ("http" = [])
  // )
)]
#[get("")]
pub(crate) async fn get_products(
  db: web::Data<Pool>,
  query: web::Query<GetProductsParams>, // _auth: BearerAuth
) -> Result<HttpResponse, actix_web::Error> {
  // let _claims = ValidatorBuilder::new()
  //   .with_or(vec![
  //     ScopeRequirement::Scope(PermissionName::ReadAll),
  //     ScopeRequirement::Scope(PermissionName::ReadProduct),
  //   ])
  //   .validate(&auth)?;

  let result = web::block(move || db_get_all_products(db, query.into_inner())).await?;

  match result {
    Ok(res) => Ok(HttpResponse::Ok().json(res)),
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}

fn fold_products_and_measures(
  results: Vec<(Product, ProductToMeasure, Unit, Option<ProductToImage>)>,
) -> Vec<ProductResponse> {
  let (product_map, product_order) = results.into_iter().fold(
    (
      HashMap::<Product, Vec<(ProductToMeasure, Unit, Option<ProductToImage>)>>::new(),
      Vec::<Product>::new(),
    ),
    |(mut acc, mut order), (product, product_measure, unit, product_image)| {
      if !acc.contains_key(&product) {
        order.push(product.clone())
      }

      acc
        .entry(product)
        .or_default()
        .push((product_measure, unit, product_image));

      (acc, order)
    },
  );

  product_order
    .into_iter()
    .filter_map(|product| {
      product_map.get(&product).map(|conjoined| {
        let measures: Vec<ProductToMeasureResponse> = conjoined
          .iter()
          .map(|(product_to_measure, unit, _)| ProductToMeasureResponse {
            product_to_measure: product_to_measure.clone(),
            unit: unit.clone(),
          })
          .collect();

        let images: Vec<ProductToImage> = conjoined.iter().filter_map(|(_, _, image)| image.clone()).collect();

        ProductResponse {
          product,
          measures,
          images,
        }
      })
    })
    .collect()
}

pub fn db_insert_products(
  new_products: Vec<NewProductPost>,
  conn: &mut diesel::r2d2::PooledConnection<diesel::r2d2::ConnectionManager<diesel::PgConnection>>,
) -> anyhow::Result<bool> {
  match conn.transaction(|conn| {
    let hashmap_unitsymbol_to_id =
      units::table
        .load::<Unit>(conn)?
        .into_iter()
        .fold(HashMap::<UnitSymbol, i32>::new(), |mut acc, unit| {
          acc.entry(unit.symbol).or_insert(unit.id);
          acc
        });

    // This is a bit complicated, but in short this unfolds the combined post json data into
    // two seperate Vecs that can be added to their respective rows.
    let new_measures_to_products: Vec<_> = new_products
      .clone()
      .into_iter()
      .flat_map(|new_product| {
        <NewProductToMeasurePartialUnion as std::convert::Into<Vec<NewProductToMeasurePartial>>>::into(
          new_product.measures,
        )
        .into_iter()
        .map({
          let value = hashmap_unitsymbol_to_id.clone();
          move |measure| {
            let unit_id = value.get(&measure.unit);

            match unit_id {
              Some(id) => Ok(measure.convert(new_product.new_product.gtin.clone(), *id)),
              None => {
                log::error!("Failed to find symbol '{}'", measure.unit);
                Err(diesel::result::Error::RollbackTransaction)
              }
            }
          }
        })
      })
      .try_collect()?;

    let new_products_reduced: Vec<NewProduct> = new_products.clone().into_iter().map(|n| n.new_product).collect();

    let images: Vec<_> = new_products
      .clone()
      .into_iter()
      .flat_map(|n| {
        n.images.into_iter().flat_map(move |t| {
          <NewProductToImageUnion as std::convert::Into<Vec<NewProductToImage>>>::into(
            t.convert(n.new_product.gtin.clone()),
          )
        })
      })
      .collect();

    diesel::insert_into(products::table)
      .values(new_products_reduced)
      .on_conflict(products::gtin)
      .do_update()
      .set((
        products::productname.eq(excluded(products::productname)),
        products::sellsinraw.eq(excluded(products::sellsinraw)),
        products::updated_at.eq(diesel::dsl::now),
      ))
      .execute(conn)?;

    let gtins: Vec<String> = new_products.iter().map(|p| p.new_product.gtin.clone()).collect();
    diesel::delete(products_to_measures::table.filter(products_to_measures::gtin.eq_any(gtins.clone())))
      .execute(conn)?;
    diesel::delete(products_to_images::table.filter(products_to_images::gtin.eq_any(gtins.clone()))).execute(conn)?;

    insert_into(products_to_measures::table)
      .values(new_measures_to_products)
      .execute(conn)?;
    insert_into(products_to_images::table).values(images).execute(conn)?;

    diesel::result::QueryResult::Ok(())
  }) {
    Ok(_) => (),
    Err(err) => {
      return Err(anyhow!("Adding product(s) failed: {}", err));
    }
  }

  Ok(true)
}

#[utoipa::path(
  context_path = V1_PATH,
  request_body(description = "A product or products",
    content(
      (NewProductPost),
      (Vec<NewProductPost>),
    ),
  ),
  responses(
    (status = OK, body = bool),
    (status = 401),
    (status = 500),
  ),
  security(
    ("http" = []),
  )
)]
#[post("")]
pub(crate) async fn post_products(
  pool: web::Data<Pool>,
  new_product_union: web::Json<NewProductPostUnion>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::CreateAll, PermissionName::CreateProduct])
    .validate(&claims.permissions)?;

  let new_products: Vec<NewProductPost> = new_product_union.into_inner().into();

  let result = web::block(move || {
    let mut conn = pool.get().unwrap();
    db_insert_products(new_products, &mut conn)
  })
  .await;

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(res)),
    Ok(Err(err)) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}

fn db_delete_product_by_gtin(pool: web::Data<Pool>, gtin: String) -> anyhow::Result<ProductResponse> {
  let mut conn = pool.get()?;

  let result = products::table
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .left_join(products_to_images::table.on(products_to_images::gtin.eq(products::gtin)))
    .filter(products::gtin.eq(&gtin))
    .load::<(Product, ProductToMeasure, Unit, Option<ProductToImage>)>(&mut conn)?;

  let product_response = fold_products_and_measures(result)
    .first()
    .cloned()
    .ok_or_else(|| anyhow!("Failed to find product"))?;

  diesel::delete(products::table.filter(products::gtin.eq(&gtin))).execute(&mut conn)?;

  Ok(product_response)
}

#[utoipa::path(
  context_path = V1_PATH,
  responses(
    (status = OK, body = ProductResponse),
    (status = 401),
  ),
  params(
    ("gtin" = String, Path, description = "Global Trade Item Number (gtin)")
  ),
  security(
    ("http" = [])
  )
)]
#[delete("/{gtin}")]
pub(crate) async fn delete_product(
  gtin: web::Path<String>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::DeleteAll, PermissionName::DeleteProduct])
    .validate(&claims.permissions)?;

  let result = {
    let gtin = gtin.clone();
    web::block(move || db_delete_product_by_gtin(db, gtin)).await
  };

  match result {
    Ok(Ok(res)) => Ok(HttpResponse::Ok().json(Into::<ProductResponse>::into(res))),
    Ok(Err(err)) => match err.downcast_ref::<diesel::result::Error>() {
      Some(diesel::result::Error::NotFound) => {
        log::warn!("Product not found {}", gtin);
        Ok(Err(ServiceError::NotFound(Some("Product not found".to_string())))?)
      }
      Some(_) => {
        log::error!("{}", err);
        Ok(Err(ServiceError::InternalServerError)?)
      }
      None => {
        log::error!("{}", err);
        Ok(Err(ServiceError::InternalServerError)?)
      }
    },
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}
