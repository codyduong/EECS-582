#[cfg(all(feature = "serde", feature = "utoipa"))]
pub mod graphql;

#[cfg(all(feature = "serde", feature = "chrono"))]
pub mod to_rfc3339 {
  use chrono::{DateTime, NaiveDateTime, Utc};
  use serde::{self, Deserialize, Deserializer, Serializer};

  pub fn serialize<S>(dt: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    let dt_utc = DateTime::<Utc>::from_naive_utc_and_offset(*dt, Utc);
    serializer.serialize_str(&dt_utc.to_rfc3339())
  }

  pub fn deserialize<'de, D>(deserializer: D) -> Result<NaiveDateTime, D::Error>
  where
    D: Deserializer<'de>,
  {
    let s = String::deserialize(deserializer)?;
    DateTime::parse_from_rfc3339(&s)
      .map(|dt| dt.naive_utc())
      .map_err(serde::de::Error::custom)
  }

  pub mod option {
    use super::*;

    pub fn serialize<S>(dt: &Option<NaiveDateTime>, serializer: S) -> Result<S::Ok, S::Error>
    where
      S: Serializer,
    {
      match dt {
        Some(dt) => super::serialize(dt, serializer),
        None => serializer.serialize_none(),
      }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<NaiveDateTime>, D::Error>
    where
      D: Deserializer<'de>,
    {
      Ok(Some(super::deserialize(deserializer)?))
    }
  }
}

#[cfg(feature = "actix-web")]
pub mod errors {
  use actix_web::{error::ResponseError, HttpResponse};
  use derive_more::Display;

  #[derive(Debug, Display)]
  pub enum ServiceError {
    #[display("Internal Server Error")]
    InternalServerError,

    Conflict(String),

    #[display("Not Found")]
    NotFound(Option<String>),

    #[display("BadRequest: {}", _0)]
    BadRequest(String),

    // THIS ERROR should be returned on a permission failure, not on an unauthenticated users. Instead either
    // return 404, 400, depending on your intent at the endpoint
    Unauthorized,

    Forbidden,
  }

  // impl ResponseError trait allows to convert our errors into http responses with appropriate data
  impl ResponseError for ServiceError {
    fn error_response(&self) -> HttpResponse {
      match self {
        ServiceError::InternalServerError => {
          HttpResponse::InternalServerError().json("Internal Server Error, Please try later")
        }
        ServiceError::NotFound(msg) => HttpResponse::NotFound().json(msg.as_ref().map_or("Not Found", |s| s)),
        ServiceError::BadRequest(ref message) => HttpResponse::BadRequest().json(message),
        ServiceError::Unauthorized => HttpResponse::Unauthorized().json("Not allowed"),
        ServiceError::Forbidden => HttpResponse::Forbidden().json("Not allowed"),
        ServiceError::Conflict(ref msg) => HttpResponse::Conflict().json(msg),
      }
    }
  }

  #[cfg(feature = "diesel")]
  impl From<diesel::result::Error> for ServiceError {
    fn from(value: diesel::result::Error) -> Self {
      match value {
        // diesel::result::Error::InvalidCString(nul_error) => todo!(),
        // diesel::result::Error::DatabaseError(database_error_kind, database_error_information) => todo!(),
        // diesel::result::Error::NotFound => todo!(),
        // diesel::result::Error::QueryBuilderError(error) => todo!(),
        // diesel::result::Error::DeserializationError(error) => todo!(),
        // diesel::result::Error::SerializationError(error) => todo!(),
        // diesel::result::Error::RollbackErrorOnCommit { rollback_error, commit_error } => todo!(),
        // diesel::result::Error::RollbackTransaction => todo!(),
        // diesel::result::Error::AlreadyInTransaction => todo!(),
        // diesel::result::Error::NotInTransaction => todo!(),
        // diesel::result::Error::BrokenTransactionManager => todo!(),
        _ => ServiceError::InternalServerError,
      }
    }
  }
}
