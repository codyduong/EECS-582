use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::get;
use actix_web::post;
use actix_web::web;
use actix_web::web::ServiceConfig;
use actix_web::HttpResponse;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use anyhow::anyhow;
use auth::errors::ServiceError;
use auth::models::PermissionName;
use auth::validator::ValidatorBuilder;
use diesel::dsl::insert_into;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::JoinOnDsl;
use diesel::{QueryDsl, RunQueryDsl};
use itertools::Itertools;
use std::collections::HashMap;
use std::vec::Vec;

pub(crate) const V1_PATH: &str = "/api/v1/products";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(
      web::scope(V1_PATH)
        .service(get_product)
        .service(get_products)
        .service(post_products),
    );
  }
}

fn db_get_product_by_gtin(pool: web::Data<Pool>, gtin: String) -> anyhow::Result<ProductResponse> {
  let mut conn = pool.get().unwrap();

  let result = products::table
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .filter(products::gtin.eq(gtin))
    .load::<(Product, ProductToMeasure, Unit)>(&mut conn)?;

  fold_products_and_measures(result)
    .first()
    .cloned()
    .ok_or_else(|| anyhow!("Failed to find product"))
}

#[utoipa::path(
  context_path = super::V1_PATH,
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
#[get("/{gtin}")]
pub(crate) async fn get_product(
  gtin: web::Path<String>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::ReadAll)
    .validate(auth)?;

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

fn db_get_all_products(pool: web::Data<Pool>) -> Result<Vec<ProductResponse>, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  // let items = products::table.load::<Product>(&mut conn)?;

  let result = products::table
    .inner_join(products_to_measures::table.on(products_to_measures::gtin.eq(products::gtin)))
    .inner_join(units::table.on(units::id.eq(products_to_measures::unit_id)))
    .load::<(Product, ProductToMeasure, Unit)>(&mut conn)?;

  Ok(fold_products_and_measures(result))
}

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = OK, body = Vec<ProductResponse>),
    (status = 401),
  ),
  security(
    ("http" = [])
  )
)]
#[get("")]
pub(crate) async fn get_products(db: web::Data<Pool>, auth: BearerAuth) -> Result<HttpResponse, actix_web::Error> {
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::ReadAll)
    .validate(auth)?;

  let result = web::block(move || db_get_all_products(db)).await;

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

fn fold_products_and_measures(results: Vec<(Product, ProductToMeasure, Unit)>) -> Vec<ProductResponse> {
  results
    .into_iter()
    .fold(
      HashMap::<Product, Vec<(ProductToMeasure, Unit)>>::new(),
      |mut acc, (product, product_measure, unit)| {
        acc
          .entry(product) // Clone the product for the key
          .or_default()
          .push((product_measure, unit));
        acc
      },
    )
    .into_iter()
    .map(|(product, conjoined)| {
      let measures = conjoined
        .into_iter()
        .map(|(product_to_measure, unit)| ProductToMeasureResponse {
          product_to_measure,
          unit,
        })
        .collect();
      ProductResponse { product, measures }
    })
    .collect()
}

#[utoipa::path(
  context_path = super::V1_PATH,
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
  let _claims = ValidatorBuilder::new()
    .with_scope(PermissionName::CreateAll)
    .validate(auth)?;

  let new_products: Vec<NewProductPost> = new_product_union.into_inner().into();

  let mut conn = pool.get().unwrap();

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
      .flat_map(|un| {
        let unit_id = hashmap_unitsymbol_to_id.get(&un.measures.unit);

        match unit_id {
          Some(id) => itertools::Either::Left(
            Into::<Vec<NewProductToMeasurePartial>>::into(un.measures.new_product_to_measure)
              .into_iter()
              .map(move |v| v.convert(un.new_product.gtin.clone(), *id))
              .map(Ok),
          ),
          None => {
            log::error!("Failed to find symbol '{}'", un.measures.unit);
            itertools::Either::Right(std::iter::once(Err(diesel::result::Error::RollbackTransaction)))
          }
        }
      })
      .try_collect()?;

    let new_products_reduced: Vec<NewProduct> = new_products.into_iter().map(|n| n.new_product).collect();

    insert_into(products::table)
      .values(new_products_reduced)
      .execute(conn)?;

    insert_into(products_to_measures::table)
      .values(new_measures_to_products)
      .execute(conn)?;

    diesel::result::QueryResult::Ok(())
  }) {
    Ok(_) => (),
    Err(err) => {
      log::error!("Adding product(s) failed: {}", err);
      return Ok(Err(ServiceError::InternalServerError)?);
    }
  }

  Ok(HttpResponse::Ok().json(false))
}
