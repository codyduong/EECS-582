use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use crate::Pool;
use actix_web::delete;
use actix_web::get;
use actix_web::post;
use actix_web::put;
use actix_web::web::ServiceConfig;
use actix_web::{web, HttpResponse};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use common_rs::graphql::Connection as GraphConnection;
use common_rs::graphql::Node;
use common_rs::graphql::PageInfo;
use common_rs::graphql::PaginationParams;
use diesel::upsert::excluded;
use diesel::Connection;
use diesel::ExpressionMethods;
use diesel::JoinOnDsl;
use diesel::NullableExpressionMethods;
use diesel::{QueryDsl, RunQueryDsl};
use serde::Deserialize;
use std::vec::Vec;
use utoipa::ToSchema;
use validator_rs::ValidatorBuilder;

pub(crate) const V1_PATH: &str = "/api/v1/users";

pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  |config: &mut ServiceConfig| {
    config.service(web::scope("/api/v1")).service(delete_users);

    config.service(
      web::scope(V1_PATH)
        .service(get_user)
        .service(get_users)
        .service(upsert_user)
        .service(create_users)
        .service(delete_user),
    );
  }
}

#[derive(Debug, Deserialize)]
pub struct GetUsersParams {
  #[serde(flatten)]
  pagination_params: PaginationParams<i32>,
  #[serde(default)]
  include_roles: bool,
  #[serde(default)]
  include_permissions: bool,
}

fn db_get_paginated_users_with_options(
  pool: web::Data<Pool>,
  options: GetUsersParams,
) -> Result<GraphConnection<UserResponse>, diesel::result::Error> {
  let mut conn = pool.get().unwrap();
  let mut query = users::table.into_boxed();
  let params = options.pagination_params;
  let id_column = users::id;
  let cursor_fn = |x: &UserResponse| x.id.to_string();

  // Validate pagination parameters
  if params.first.is_some() && params.last.is_some() {
    return Err(diesel::result::Error::RollbackTransaction);
  }

  if params.after.is_some() && params.before.is_some() {
    return Err(diesel::result::Error::RollbackTransaction);
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
    _ => return Err(diesel::result::Error::RollbackTransaction),
  }

  let items: Vec<UserResponse> = query.load::<User>(&mut conn)?.into_iter().map(Into::into).collect();
  let user_ids: Vec<_> = items.iter().map(|x| x.id).collect();

  // Bulk fetch all related roles with left join
  let roles_map = if options.include_roles {
    users_to_roles::table
      .filter(users_to_roles::user_id.eq_any(&user_ids))
      .left_join(roles::table)
      .select((users_to_roles::user_id, roles::all_columns.nullable()))
      .load::<(i32, Option<Role>)>(&mut conn)?
      .into_iter()
      .filter_map(|(user_id, role)| role.map(|r| (user_id, r)))
      .fold(
        std::collections::HashMap::<i32, Vec<Role>>::new(),
        |mut acc, (user_id, role)| {
          acc.entry(user_id).or_default().push(role);
          acc
        },
      )
  } else {
    std::collections::HashMap::new()
  };

  // Bulk fetch all related permissions with left joins
  let permissions_map = if options.include_permissions {
    users_to_roles::table
      .filter(users_to_roles::user_id.eq_any(&user_ids))
      .left_join(roles_to_permissions::table.on(users_to_roles::role_id.eq(roles_to_permissions::role_id)))
      .left_join(permissions::table.on(permissions::id.eq(roles_to_permissions::permission_id)))
      .select((users_to_roles::user_id, permissions::all_columns.nullable()))
      .load::<(i32, Option<Permission>)>(&mut conn)?
      .into_iter()
      .filter_map(|(user_id, permission)| permission.map(|p| (user_id, p)))
      .fold(
        std::collections::HashMap::<i32, Vec<Permission>>::new(),
        |mut acc, (user_id, permission)| {
          acc.entry(user_id).or_default().push(permission);
          acc
        },
      )
  } else {
    std::collections::HashMap::new()
  };

  let mut user_responses: Vec<_> = items
    .into_iter()
    .map(|user| {
      let mut response = user;
      if options.include_roles {
        response.roles = roles_map.get(&response.id).cloned();
      }
      if options.include_permissions {
        response.permissions = permissions_map.get(&response.id).cloned();
      }
      response
    })
    .collect();

  // Check for additional pages
  let has_additional = user_responses.len() as i64 > limit.into();
  if has_additional {
    user_responses.pop();
  }

  // Get cursors without cloning items
  let start_cursor = user_responses.first().map(cursor_fn);
  let end_cursor = user_responses.last().map(cursor_fn);

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

  // Build edges without extra allocations
  let edges = user_responses
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
        (status = OK, body = GraphConnection<UserResponse>)
    ),
    params(
        ("first" = Option<i32>, Query, description = "Number of items after cursor"),
        ("after" = Option<i32>, Query, description = "Cursor for forward pagination"),
        ("last" = Option<i32>, Query, description = "Number of items before cursor"),
        ("before" = Option<i32>, Query, description = "Cursor for backward pagination"),
        ("include_roles" = Option<bool>, Query, description = "Include roles in response"),
        ("include_permissions" = Option<bool>, Query, description = "Include permissions in response"),
    ),
    security(
        ("http" = [])
    )
)]
#[get("")]
pub(crate) async fn get_users(
  db: web::Data<Pool>,
  auth: BearerAuth,
  query: web::Query<GetUsersParams>,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::ReadAll, PermissionName::ReadUser])
    .validate(&claims.permissions)?;

  let result = web::block(move || db_get_paginated_users_with_options(db, query.into_inner())).await?;

  match result {
    Ok(res) => Ok(HttpResponse::Ok().json(res)),
    Err(err) => {
      log::error!("{}", err);
      Ok(Err(ServiceError::InternalServerError)?)
    }
  }
}

fn default_true() -> bool {
  true
}

#[derive(Debug, Deserialize)]
pub struct UserQueryOptions {
  #[serde(default = "default_true")]
  include_roles: bool,
  #[serde(default = "default_true")]
  include_permissions: bool,
}

#[utoipa::path(
    context_path = V1_PATH,
    responses(
        (status = OK, body = UserResponse)
    ),
    params(
        ("id" = i32, Path, description = "User id"),
        ("include_roles" = Option<bool>, Query, description = "Include roles in response"),
        ("include_permissions" = Option<bool>, Query, description = "Include permissions in response"),
    ),
    security(
        ("http" = [])
    )
)]
#[get("/{id}")]
pub(crate) async fn get_user(
  user_id: web::Path<i32>,
  db: web::Data<Pool>,
  auth: BearerAuth,
  query: web::Query<UserQueryOptions>,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::ReadAll, PermissionName::ReadUser])
    .validate(&claims.permissions)?;

  let query_options = query.into_inner();
  let result = web::block(move || {
    let mut conn = db.get().unwrap();

    let user = users::table.find(*user_id).get_result::<User>(&mut conn)?;
    let mut response = UserResponse::from(user);

    if query_options.include_roles {
      let roles = users_to_roles::table
        .filter(users_to_roles::user_id.eq(*user_id))
        .left_join(roles::table)
        .select((users_to_roles::user_id, roles::all_columns.nullable()))
        .load::<(i32, Option<Role>)>(&mut conn)?
        .into_iter()
        .filter_map(|(_, role)| role)
        .collect();
      response.roles = Some(roles);
    }

    if query_options.include_permissions {
      let permissions = users_to_roles::table
        .filter(users_to_roles::user_id.eq(*user_id))
        .left_join(roles_to_permissions::table.on(users_to_roles::role_id.eq(roles_to_permissions::role_id)))
        .left_join(permissions::table.on(permissions::id.eq(roles_to_permissions::permission_id)))
        .select((users_to_roles::user_id, permissions::all_columns.nullable()))
        .load::<(i32, Option<Permission>)>(&mut conn)?
        .into_iter()
        .filter_map(|(_, permission)| permission)
        .collect();
      response.permissions = Some(permissions);
    }

    Ok::<_, diesel::result::Error>(response)
  })
  .await?
  .map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  Ok(HttpResponse::Ok().json(result))
}

#[derive(Debug, Deserialize)]
pub struct UpsertQueryParams {
  #[serde(default)]
  upsert: bool,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(untagged)]
pub enum UserInput {
  Single(NewUserDTO),
  Multiple(Vec<NewUserDTO>),
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct NewUserDTO {
  pub email: String,
  pub username: String,
  pub password_hash: String,
}

impl From<UserInput> for Vec<NewUser<'static>> {
  fn from(val: UserInput) -> Self {
    match val {
      UserInput::Single(user) => vec![NewUser {
        email: Box::leak(user.email.into_boxed_str()),
        username: Some(Box::leak(user.username.into_boxed_str())),
        password_hash: Box::leak(user.password_hash.into_boxed_str()),
      }],
      UserInput::Multiple(users) => users
        .into_iter()
        .map(|user| NewUser {
          email: Box::leak(user.email.into_boxed_str()),
          username: Some(Box::leak(user.username.into_boxed_str())),
          password_hash: Box::leak(user.password_hash.into_boxed_str()),
        })
        .collect(),
    }
  }
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct DeleteUsersRequest {
  pub ids: Vec<i32>,
}

#[utoipa::path(
    context_path = V1_PATH,
    request_body = NewUserDTO,
    responses(
        (status = CREATED, body = ()),
        (status = CONFLICT, description = "User already exists when upsert=false")
    ),
    params(
        ("upsert" = Option<bool>, Query, description = "Allow upsert if user exists"),
    ),
    security(
        ("http" = [])
    )
)]
#[put("/{id}")]
pub(crate) async fn upsert_user(
  user_id: web::Path<i32>,
  db: web::Data<Pool>,
  auth: BearerAuth,
  query: web::Query<UpsertQueryParams>,
  body: web::Json<NewUserDTO>,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;

  // todo validate they have update if they are upserting
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::CreateAll, PermissionName::CreateUser])
    .validate(&claims.permissions)?;

  web::block(move || {
    let mut conn = db.get().unwrap();
    conn.transaction(|conn| {
      let existing_user = users::table.find(*user_id).get_result::<User>(conn);

      match (existing_user, query.upsert) {
        (Ok(user), _) => {
          // Update existing user
          diesel::update(users::table.find(user.id))
            .set((
              users::email.eq(&body.email),
              users::username.eq(&body.username),
              users::password_hash.eq(&body.password_hash),
              // users::updated_at.eq(diesel::dsl::now),
            ))
            .execute(conn)?;
          Ok(user.id)
        }
        (Err(diesel::result::Error::NotFound), true) => {
          // Insert new user with specified ID
          diesel::insert_into(users::table)
            .values(NewUser {
              // id: Some(*user_id),
              email: &body.email,
              username: Some(&body.username),
              password_hash: &body.password_hash,
            })
            .execute(conn)?;
          Ok(*user_id)
        }
        (Err(diesel::result::Error::NotFound), false) => {
          Err(ServiceError::Conflict("User not found and upsert disabled".into()))
        }
        (Err(_e), _) => Err(ServiceError::InternalServerError),
      }
    })
  })
  .await??;

  // todo: Return the updated/created user
  Ok(HttpResponse::Ok().json(()))
}

#[utoipa::path(
    context_path = V1_PATH,
    request_body = UserInput,
    responses(
        // (status = CREATED, body = Vec<UserResponse>),
        (status = CREATED, body = ()),
        (status = CONFLICT, description = "User already exists when upsert=false")
    ),
    params(
        ("upsert" = Option<bool>, Query, description = "Allow upsert if user exists"),
    ),
    security(
        ("http" = [])
    )
)]
#[post("")]
pub(crate) async fn create_users(
  db: web::Data<Pool>,
  auth: BearerAuth,
  query: web::Query<UpsertQueryParams>,
  body: web::Json<UserInput>,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;

  // todo validate they have update if they are upserting
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::CreateAll, PermissionName::CreateUser])
    .validate(&claims.permissions)?;

  let new_users: Vec<NewUser> = body.into_inner().into();
  let upsert = query.upsert;

  web::block(move || {
    let mut conn = db.get().unwrap();
    conn.transaction(|conn| {
      if upsert {
        diesel::insert_into(users::table)
          .values(&new_users)
          .on_conflict(users::id)
          .do_update()
          .set((
            users::username.eq(excluded(users::username)),
            users::password_hash.eq(excluded(users::password_hash)),
            // users::updated_at.eq(diesel::dsl::now),
          ))
          .execute(conn)?;
      } else {
        diesel::insert_into(users::table).values(&new_users).execute(conn)?;
      }

      Ok::<(), diesel::result::Error>(())
    })
  })
  .await?
  .map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  // Return all created/updated users
  // let users = web::block(move || {
  //     let mut conn = db.get().unwrap();
  //     users::table
  //         .filter(users::id.eq_any(result))
  //         .load::<User>(&mut conn)
  //         .map(|users| users.into_iter().map(UserResponse::from).collect::<Vec<_>>())
  // })
  // .await?.map_err(|e| {
  //   log::error!("Error: {}", e);
  //   ServiceError::InternalServerError
  // })?;

  Ok(HttpResponse::Created().json(()))
}

#[utoipa::path(
    context_path = V1_PATH,
    responses(
        (status = NO_CONTENT),
        (status = NOT_FOUND, description = "User not found")
    ),
    security(
        ("http" = [])
    )
)]
#[delete("/{id}")]
pub(crate) async fn delete_user(
  user_id: web::Path<i32>,
  db: web::Data<Pool>,
  auth: BearerAuth,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::DeleteAll, PermissionName::DeleteUser])
    .validate(&claims.permissions)?;

  web::block(move || {
    let mut conn = db.get().unwrap();
    diesel::update(users::table.find(*user_id))
      .set((users::deleted.eq(true), users::deleted_at.eq(diesel::dsl::now)))
      .execute(&mut conn)
  })
  .await?
  .map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  Ok(HttpResponse::NoContent().finish())
}

#[utoipa::path(
    context_path = "/api/v1/",
    request_body = DeleteUsersRequest,
    responses(
        (status = NO_CONTENT),
        (status = NOT_FOUND, description = "One or more users not found")
    ),
    security(
        ("http" = [])
    )
)]
#[post("/delete-users")]
pub(crate) async fn delete_users(
  db: web::Data<Pool>,
  auth: BearerAuth,
  body: web::Json<DeleteUsersRequest>,
) -> Result<HttpResponse, actix_web::Error> {
  let claims = auth::get_claims(&auth)?;
  ValidatorBuilder::new()
    .with_or(vec![PermissionName::DeleteAll, PermissionName::DeleteUser])
    .validate(&claims.permissions)?;

  web::block(move || {
    let mut conn = db.get().unwrap();
    diesel::update(users::table.filter(users::id.eq_any(&body.ids)))
      .set((users::deleted.eq(true), users::deleted_at.eq(diesel::dsl::now)))
      .execute(&mut conn)
  })
  .await?
  .map_err(|e| {
    log::error!("Error: {}", e);
    ServiceError::InternalServerError
  })?;

  Ok(HttpResponse::NoContent().finish())
}
