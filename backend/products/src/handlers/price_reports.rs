use std::collections::HashMap;

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
use common_rs::graphql::GraphConnection;
use common_rs::graphql::Node;
use common_rs::graphql::PageInfo;
use common_rs::graphql::PaginationParams;
use diesel::connection;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::JoinOnDsl;
use diesel::QueryDsl;
use diesel::RunQueryDsl;
use diesel::SelectableHelper;
use serde::Deserialize;
use serde::Serialize;
use serde_with::serde_as;
use serde_with::DisplayFromStr;
use utoipa::ToSchema;
use validator_rs::ValidatorBuilder;

use crate::models::PriceResponse;

pub(crate) const V1_PATH: &str = "/api/v1/price_report";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(
      web::scope(V1_PATH)
        .service(get_price_reports_for_gtin)
        .service(get_price_reports_for_gtins)
        .service(post_price_report),
    );
  }
}

#[serde_as]
#[derive(Deserialize)]
struct PriceReportParams {
  #[serde(flatten)]
  pagination_params: PaginationParams<i64>,
  #[serde_as(as = "Option<DisplayFromStr>")]
  marketplace_id: Option<i32>,
}

fn db_get_price_report_for_gtin(
  pool: web::Data<Pool>,
  gtin: &str,
  params: PriceReportParams,
) -> anyhow::Result<GraphConnection<PriceResponse>> {
  let mut conn = pool.get()?;

  let mut query = price_reports::table
    .inner_join(
      price_report_to_marketplaces::table.on(price_reports::id.eq(price_report_to_marketplaces::price_report_id)),
    )
    .inner_join(marketplaces::table.on(price_report_to_marketplaces::marketplace_id.eq(marketplaces::id)))
    .inner_join(companies::table.on(marketplaces::company_id.eq(companies::id)))
    .left_join(physical_marketplaces::table.on(marketplaces::id.eq(physical_marketplaces::id)))
    .left_join(online_marketplaces::table.on(marketplaces::id.eq(online_marketplaces::id)))
    .filter(price_reports::gtin.eq(gtin))
    .into_boxed();

  if let Some(mid) = params.marketplace_id {
    query = query.filter(price_report_to_marketplaces::marketplace_id.eq(mid))
  }

  let params = params.pagination_params;
  let id_column = price_reports::id;
  let cursor_fn = |x: &PriceResponse| x.price_report.reported_at.to_string();

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

  let mut result: Vec<PriceResponse> = query
    .select((
      PriceReport::as_select(),
      Company::as_select(),
      Marketplace::as_select(),
      Option::<PhysicalMarketplace>::as_select(),
      Option::<OnlineMarketplace>::as_select(),
    ))
    .load::<(
      PriceReport,
      Company,
      Marketplace,
      Option<PhysicalMarketplace>,
      Option<OnlineMarketplace>,
    )>(&mut conn)?
    .into_iter()
    .map(
      |(price_report, company, marketplace, physical_marketplace, online_marketplace)| PriceResponse {
        price_report,
        company: company.clone(),
        // TODO we should graphql federation for this nested behavior, not this manual join. w/e -@codyduong
        marketplace: MarketplaceResponse {
          marketplace,
          company,
          physical_marketplace,
          online_marketplace,
        },
      },
    )
    .collect();

  let has_additional = result.len() as i64 > limit.into();
  if has_additional {
    result.pop();
  }

  // Get cursors without cloning items
  let start_cursor = result.first().map(cursor_fn);
  let end_cursor = result.last().map(cursor_fn);

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

  let edges = result
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
    (status = OK, body = GraphConnection<PriceResponse>),
    (status = 401),
    (status = 500),
  ),
  params(
    ("gtin" = String, Path, description = "gtin"),
    ("marketplace_id" = Option<String>, Query),
    ("first" = Option<i32>, Query, description = "Number of items after cursor"),
    ("after" = Option<i32>, Query, description = "Cursor for forward pagination"),
    ("last" = Option<i32>, Query, description = "Number of items before cursor"),
    ("before" = Option<i32>, Query, description = "Cursor for backward pagination"),
  ),
  security(
    ("http" = [""])
  )
)]
#[get("/by-gtin/{gtin}")]
pub(crate) async fn get_price_reports_for_gtin(
  gtin: web::Path<String>,
  db: web::Data<Pool>,
  // auth: BearerAuth,
  query: web::Query<PriceReportParams>,
) -> Result<HttpResponse, actix_web::Error> {
  let result = { web::block(move || db_get_price_report_for_gtin(db, &gtin.into_inner(), query.into_inner())).await };

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

#[derive(Serialize, ToSchema)]
struct PriceResponses {
  #[serde(flatten)]
  connections: HashMap<String, GraphConnection<PriceResponse>>,
}

fn db_get_price_report_for_gtins(
  pool: web::Data<Pool>,
  gtins: Vec<String>,
  params: &PriceReportParams,
) -> anyhow::Result<PriceResponses> {
  let mut conn = pool.get()?;

  let mut query = price_reports::table
    .inner_join(
      price_report_to_marketplaces::table.on(price_reports::id.eq(price_report_to_marketplaces::price_report_id)),
    )
    .inner_join(marketplaces::table.on(price_report_to_marketplaces::marketplace_id.eq(marketplaces::id)))
    .inner_join(companies::table.on(marketplaces::company_id.eq(companies::id)))
    .left_join(physical_marketplaces::table.on(marketplaces::id.eq(physical_marketplaces::id)))
    .left_join(online_marketplaces::table.on(marketplaces::id.eq(online_marketplaces::id)))
    .filter(price_reports::gtin.eq_any(gtins))
    .into_boxed();

  if let Some(mid) = params.marketplace_id {
    query = query.filter(price_report_to_marketplaces::marketplace_id.eq(mid))
  }

  let params = params.pagination_params.clone();
  let id_column = price_reports::id;
  let cursor_fn = |x: &PriceResponse| x.price_report.reported_at.to_string();

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

  let all_results = query
    .select((
      PriceReport::as_select(),
      Company::as_select(),
      Marketplace::as_select(),
      Option::<PhysicalMarketplace>::as_select(),
      Option::<OnlineMarketplace>::as_select(),
    ))
    .load::<(
      PriceReport,
      Company,
      Marketplace,
      Option<PhysicalMarketplace>,
      Option<OnlineMarketplace>,
    )>(&mut conn)?;

  // We now have all the PriceResponse records for the given GTINs within the pagination limits.
  // We need to group these results by GTIN and then create a GraphConnection for each GTIN.

  let mut grouped_results: std::collections::HashMap<String, Vec<PriceResponse>> = std::collections::HashMap::new();

  for (report, company, marketplace, physical_marketplace, online_marketplace) in all_results {
    #[allow(clippy::unwrap_or_default)]
    grouped_results
      .entry(report.gtin.clone())
      .or_insert_with(Vec::new)
      .push(PriceResponse {
        price_report: report,
        company: company.clone(),
        // TODO we should graphql federation for this nested behavior, not this manual join. w/e -@codyduong
        marketplace: MarketplaceResponse {
          marketplace,
          company,
          physical_marketplace,
          online_marketplace,
        },
      });
  }

  let mut connections: HashMap<String, GraphConnection<PriceResponse>> = HashMap::new();

  for (gtin, mut reports) in grouped_results {
    // Apply the limit to each group if needed, and determine page info
    let has_additional = reports.len() as i64 > limit.into();
    if has_additional {
      reports.pop();
    }

    let start_cursor = reports.first().map(cursor_fn);
    let end_cursor = reports.last().map(cursor_fn);

    // Determine page info (this might need adjustment based on how you want pagination across multiple GTINs)
    // For now, it's per GTIN.
    let has_next_page = if is_forward {
      has_additional
    } else {
      params.before.is_some() // This might not be accurate across GTINs
    };

    let has_previous_page = if is_forward {
      params.after.is_some() // This might not be accurate across GTINs
    } else {
      has_additional
    };

    let edges = reports
      .into_iter()
      .map(|item| Node {
        cursor: cursor_fn(&item),
        node: item,
      })
      .collect();

    connections.insert(
      gtin,
      GraphConnection {
        edges,
        page_info: PageInfo {
          has_next_page,
          has_prev_page: has_previous_page,
          start_cursor,
          end_cursor,
        },
      },
    );
  }

  Ok(PriceResponses { connections })
}

#[derive(Deserialize, ToSchema)]
struct GtinsRequest {
  gtins: Vec<String>,
}

#[utoipa::path(
  context_path = V1_PATH,
  request_body = GtinsRequest,
  params(
    ("marketplace_id" = Option<String>, Query),
    ("first" = Option<i32>, Query, description = "Number of items after cursor"),
    ("after" = Option<i32>, Query, description = "Cursor for forward pagination"),
    ("last" = Option<i32>, Query, description = "Number of items before cursor"),
    ("before" = Option<i32>, Query, description = "Cursor for backward pagination"),
  ),
  responses(
      (status = OK, body = PriceResponses),
      (status = 401),
      (status = 500),
  ),
  security(
      ("http" = [""])
  )
)]
#[post("/by-gtins")]
pub(crate) async fn get_price_reports_for_gtins(
  db: web::Data<Pool>,
  // auth: BearerAuth,
  body: web::Json<GtinsRequest>,
  query: web::Query<PriceReportParams>,
) -> Result<HttpResponse, actix_web::Error> {
  let gtins = body.gtins.clone();

  let result = { web::block(move || db_get_price_report_for_gtins(db, gtins, &query.into_inner())).await };

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

pub(crate) fn db_add_price_report<T: Into<Vec<NewPriceReportDSL>>>(
  db: web::Data<Pool>,
  price_reports_union: T,
  user_id: i32,
) -> anyhow::Result<bool> {
  let mut conn = db.get()?;

  conn.transaction(|conn| {
    let price_reports_union = Into::<Vec<NewPriceReportDSL>>::into(price_reports_union);

    let price_reports_only: Vec<_> = price_reports_union
      .clone()
      .into_iter()
      .map(Into::<NewPriceReportPublic>::into)
      .map(|v| v.with_user(user_id))
      .collect();

    let inserted_reports = diesel::insert_into(price_reports::table)
      .values(price_reports_only)
      .get_results::<PriceReport>(conn)?;

    let price_report_to_marketplaces: Vec<PriceReportToMarketplace> = inserted_reports
      .into_iter()
      .zip(price_reports_union.into_iter())
      .map(|(report, other)| PriceReportToMarketplace {
        price_report_id: report.id,
        reported_at: report.reported_at,
        marketplace_id: other.marketplace_id,
      })
      .collect();

    diesel::insert_into(price_report_to_marketplaces::table)
      .values(price_report_to_marketplaces)
      .execute(conn)?;

    Ok::<(), diesel::result::Error>(())
  })?;

  Ok(true)
}

#[utoipa::path(
  context_path = V1_PATH,
  request_body(description = "Price report(s)",
    content(
      (NewPriceReportDSL),
      (Vec<NewPriceReportDSL>),
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
pub(crate) async fn post_price_report(
  db: web::Data<Pool>,
  body: web::Json<NewPriceReportDSLUnion>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::CreateAll, PermissionName::CreatePriceReport])
    .validate(&claims.permissions)?;

  let id = claims.sub;

  let result = web::block(move || db_add_price_report(db, body.into_inner(), id)).await?;

  match result {
    Ok(res) => Ok(HttpResponse::Ok().json(res)),
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}
