/*
  Name: register.rs

  Description:
  The endpoint handler for `/api/v1/register`

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add authentication endpoints
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
  - 2025-02-26 - @codyduong - use web blocking, return user token on successful registration
                              make username nullable
  - 2025-02-26 - @codyduong - make claims more strict, add some initial groundwork for JWT refresh tokens
*/

use crate::errors::ServiceError;
use crate::models::*;
use crate::schema::*;
use actix_web::http::header;
use actix_web::{post, web, HttpResponse};
use bcrypt::hash;
use diesel::{insert_into, prelude::*};
use serde::Deserialize;
use utoipa::ToSchema;

#[utoipa::path(
  context_path = super::V1_PATH,
  responses(
    (status = CREATED, headers(
      ("authorization" = String),
      ("x-refresh-token" = String),
    )),
  ),
)]
#[post("/register")]
pub(crate) async fn register_route(
  db: web::Data<crate::Pool>,
  new_user: web::Json<RegisterRequest>,
) -> Result<HttpResponse, actix_web::Error> {
  // guard against registering reserved names
  // if new_user
  //   .username
  //   .as_ref()
  //   .is_some_and(|n| RESERVED_TEST_USERNAMES.contains(&n.as_str()))
  // {
  //   // todo better error here
  //   return Err(ServiceError::InternalServerError)?;
  // }

  let hashed = hash(&new_user.password, 10).map_err(|err| {
    log::error!("Failed to hash: {}", err);
    ServiceError::InternalServerError
  })?;
  let new_user = new_user.into_inner();

  let res = {
    let new_user = new_user.clone();
    web::block(move || {
      let user = NewUser {
        username: new_user.username.as_deref(),
        email: &new_user.email,
        password_hash: &hashed,
      };

      let mut conn = db.get().unwrap();

      conn.transaction(|conn| {
        insert_into(users::table).values(&user).execute(conn)?;

        let user = users::table
          .filter(users::email.eq(&new_user.email))
          .first::<User>(conn)?;

        let perms = auth::get_permissions(conn, user.id)?;

        let res = auth::create_jwt()
          .user_id(user.id)
          .permissions(perms)
          .email(user.email)
          .username(user.username)
          .call()
          .map_err(|_| diesel::result::Error::RollbackTransaction)?;

        diesel::result::QueryResult::Ok(res)
      })
    })
    .await?
  };

  match res {
    Ok((access_token, refresh_token)) => {
      let mut res = HttpResponse::Ok();

      res.append_header((header::AUTHORIZATION, format!("Bearer {}", access_token)));
      if let Some(refresh_token) = refresh_token {
        res.append_header(("x-refresh-token", refresh_token));
      }

      Ok(res.finish())
    }
    Err(e) => {
      log::error!("Registering user ({}) failed, rolled back: \n{}", &new_user.email, e);
      Err(ServiceError::InternalServerError)?
    }
  }
}

#[derive(Deserialize, ToSchema, Clone)]
struct RegisterRequest {
  pub username: Option<String>,
  pub email: String,
  pub password: String,
}
