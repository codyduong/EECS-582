/*
  Name: validator.rs

  Description:
  This file exposes a convenient way to check JWT claims with complex role-access
  based control (RBAC) support.

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-07 - Cody Duong - add authentication
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-09 - Cody Duong - fix issues with `build` by creating `validate`
                              deprecate the `build`, but still allow usage in
                              less complex RBAC needs
  - 2025-02-16 - Cody Duong - add comments
  - 2025-02-26 - @codyduong - DRY out some duplicated `decode` calls and use `decode_jwt` fn instead
*/

use actix_web::dev::ServiceRequest;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use std::{future::Future, pin::Pin};

use crate::{
  errors::ServiceError,
  handlers::auth::{decode_jwt, Claims},
  models::PermissionName,
};

#[derive(Clone)]
pub enum ScopeRequirement {
  Scope(PermissionName),
  And(Vec<ScopeRequirement>),
  Or(Vec<ScopeRequirement>),
  Not(Box<ScopeRequirement>),
}

#[derive(Clone)]
pub struct ValidatorBuilder {
  required_scopes: Option<ScopeRequirement>,
}

impl Default for ValidatorBuilder {
  fn default() -> Self {
    Self::new()
  }
}

impl ValidatorBuilder {
  pub fn new() -> Self {
    ValidatorBuilder { required_scopes: None }
  }

  pub fn with_scope(mut self, scope: PermissionName) -> Self {
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(ScopeRequirement::And(vec![req, ScopeRequirement::Scope(scope)])),
      None => Some(ScopeRequirement::Scope(scope)),
    };
    self
  }

  pub fn with_and(mut self, requirements: Vec<ScopeRequirement>) -> Self {
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(ScopeRequirement::And(vec![req, ScopeRequirement::And(requirements)])),
      None => Some(ScopeRequirement::And(requirements)),
    };
    self
  }

  pub fn with_or(mut self, requirements: Vec<ScopeRequirement>) -> Self {
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(ScopeRequirement::And(vec![req, ScopeRequirement::Or(requirements)])),
      None => Some(ScopeRequirement::Or(requirements)),
    };
    self
  }

  pub fn with_not(mut self, requirement: ScopeRequirement) -> Self {
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(ScopeRequirement::And(vec![
        req,
        ScopeRequirement::Not(Box::new(requirement)),
      ])),
      None => Some(ScopeRequirement::Not(Box::new(requirement))),
    };
    self
  }

  fn check_requirements(&self, permissions: &Vec<PermissionName>) -> bool {
    match &self.required_scopes {
      Some(req) => self.check_requirement(req, permissions),
      None => true, // No requirements, always valid
    }
  }

  #[allow(clippy::only_used_in_recursion)]
  fn check_requirement(&self, requirement: &ScopeRequirement, permissions: &Vec<PermissionName>) -> bool {
    match requirement {
      ScopeRequirement::Scope(scope) => permissions.contains(scope),
      ScopeRequirement::And(requirements) => requirements.iter().all(|r| self.check_requirement(r, permissions)),
      ScopeRequirement::Or(requirements) => requirements.iter().any(|r| self.check_requirement(r, permissions)),
      ScopeRequirement::Not(requirement) => !self.check_requirement(requirement, permissions),
    }
  }

  /// Used to build a middleware function, this does not allow finer grain access control.
  /// Only use to block a whole scope.
  ///
  /// # Examples
  ///
  /// ```
  /// use auth::models::PermissionName;
  /// use auth::validator::ValidatorBuilder;
  /// use actix_web::get;
  /// use actix_web::web;
  /// use actix_web::HttpResponse;
  /// use actix_web::web::ServiceConfig;
  /// use actix_web_httpauth::middleware::HttpAuthentication;
  ///
  /// pub fn configure() -> impl FnOnce(&mut ServiceConfig) {
  ///   |config: &mut ServiceConfig| {
  ///     #[allow(deprecated)]
  ///     let read_user = HttpAuthentication::bearer(ValidatorBuilder::new().with_scope(PermissionName::ReadAll).build());
  ///     config.service(
  ///       web::scope("/foobar")
  ///         .wrap(read_user)
  ///         .service(get_users)
  ///     );
  ///   }
  /// }
  ///
  /// #[get("/{id}")]
  /// pub async fn get_users() -> Result<HttpResponse, actix_web::Error> {
  ///   Ok(HttpResponse::Ok().json(false))
  /// }
  /// ```
  #[allow(clippy::type_complexity)]
  #[deprecated(note = "Don't register a middleware, use `validate` instead")]
  pub fn build(
    self,
  ) -> impl Fn(
    ServiceRequest,
    BearerAuth,
  ) -> Pin<Box<dyn Future<Output = Result<ServiceRequest, (actix_web::Error, ServiceRequest)>>>>
       + Send
       + Sync
       + Clone {
    move |req: ServiceRequest, credentials: BearerAuth| {
      let token = credentials.token().to_string();

      let validator = self.clone();

      let fut = async move {
        match decode_jwt(&token) {
          Ok(token_data) => {
            if validator.check_requirements(&token_data.permissions) {
              Ok(req)
            } else {
              Err((ServiceError::Unauthorized.into(), req))
            }
          }
          Err(e) => {
            log::debug!("Attempted: {:?}", e);
            Err((ServiceError::BadRequest("Invalid token".to_string()).into(), req))
          },
        }
      };

      Box::pin(fut)
    }
  }

  /// Validate a user with their JWT, returns either a successful claim, or
  /// an unauthorized error which can be quickly propogated.
  ///
  /// # Examples
  ///
  /// ```
  /// use actix_web::get;
  /// use actix_web::HttpResponse;
  /// use actix_web_httpauth::extractors::bearer::BearerAuth;
  /// use auth::models::PermissionName;
  /// use auth::validator::ValidatorBuilder;
  ///
  /// #[get("")]
  /// pub(crate) async fn get_product(auth: BearerAuth) -> Result<HttpResponse, actix_web::Error> {
  ///   let _claims = ValidatorBuilder::new()
  ///     .with_scope(PermissionName::ReadAll)
  ///     .validate(&auth)?;
  ///
  ///   Ok(HttpResponse::Ok().json(false))
  /// }
  /// ```
  pub fn validate(self, credentials: &BearerAuth) -> Result<Claims, actix_web::Error> {
    let token = credentials.token().to_string();

    match decode_jwt(&token) {
      Ok(token_data) => {
        if self.check_requirements(&token_data.permissions) {
          Ok(token_data)
        } else {
          Err(ServiceError::Unauthorized.into())
        }
      }
      Err(_) => Err(ServiceError::BadRequest("Invalid token".to_string()).into()),
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_simple_scope() {
    let builder = ValidatorBuilder::new().with_scope(PermissionName::ReadAll);
    assert!(builder.check_requirements(&vec![PermissionName::ReadAll]));
    assert!(!builder.check_requirements(&vec![PermissionName::CreateAll]));
  }

  #[test]
  fn test_and_scope() {
    let builder = ValidatorBuilder::new()
      .with_scope(PermissionName::ReadAll)
      .with_scope(PermissionName::CreateAll);

    assert!(builder.check_requirements(&vec![PermissionName::ReadAll, PermissionName::CreateAll]));
    assert!(!builder.check_requirements(&vec![PermissionName::ReadAll]));
  }

  #[test]
  fn test_or_scope() {
    let builder = ValidatorBuilder::new().with_or(vec![
      ScopeRequirement::Scope(PermissionName::ReadAll),
      ScopeRequirement::Scope(PermissionName::CreateAll),
    ]);

    assert!(builder.check_requirements(&vec![PermissionName::ReadAll]));
    assert!(builder.check_requirements(&vec![PermissionName::CreateAll]));
    assert!(!builder.check_requirements(&vec![]));
  }

  #[test]
  fn test_not_scope() {
    let builder = ValidatorBuilder::new().with_not(ScopeRequirement::Scope(PermissionName::UpdateAll));

    assert!(builder.check_requirements(&vec![PermissionName::ReadAll]));
    assert!(!builder.check_requirements(&vec![PermissionName::UpdateAll]));
  }

  #[test]
  fn test_complex_scope() {
    let builder = ValidatorBuilder::new()
      .with_scope(PermissionName::ReadAll)
      .with_or(vec![
        ScopeRequirement::Scope(PermissionName::CreateAll),
        ScopeRequirement::Not(Box::new(ScopeRequirement::Scope(PermissionName::UpdateAll))),
      ]);

    assert!(builder.check_requirements(&vec![PermissionName::ReadAll, PermissionName::CreateAll]));
    assert!(builder.check_requirements(&vec![PermissionName::ReadAll]));
    assert!(!builder.check_requirements(&vec![PermissionName::ReadAll, PermissionName::UpdateAll]));
  }
}
