/*
  Name: error.rs

  Description:
  custom error types

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-12 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - add comments

  Preconditions: N/A
  Acceptable Inputs: N/A
  Unacceptable Inputs: N/A
  Postconditions: N/A
  Return Values: N/A
  Error and Exception Conditions: N/A
  Side Effects: N/A
  Invariants: N/A
*/

// TODO this should be moved into a shared crate rather than in the auth crate.
// It should probably be something like: grocerywise-web-errors, or something...
// this is never going to get done. LOL!

use actix_web::{error::ResponseError, HttpResponse};
use derive_more::Display;

#[derive(Debug, Display)]
pub enum ServiceError {
  #[display("Internal Server Error")]
  InternalServerError,

  #[display("Not Found")]
  NotFound(Option<String>),

  #[display("BadRequest: {}", _0)]
  BadRequest(String),

  Unauthorized,
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
      ServiceError::Unauthorized => HttpResponse::Forbidden().json("Not allowed"),
    }
  }
}
