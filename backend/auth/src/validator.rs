use actix_web::dev::ServiceRequest;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use std::{env, future::Future, pin::Pin};

use crate::{errors::ServiceError, handlers::auth::Claims, models::PermissionName};

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

  // async closures, more like async close my brain into a mush -- @codyduong
  #[allow(clippy::type_complexity)]
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
      let secret_key = env::var("SECRET_KEY").expect("SECRET_KEY must be set");

      let validator = self.clone();

      let fut = async move {
        match decode::<Claims>(
          &token,
          &DecodingKey::from_secret(secret_key.as_ref()),
          &Validation::new(Algorithm::HS256),
        ) {
          Ok(token_data) => {
            if validator.check_requirements(&token_data.claims.permissions) {
              Ok(req)
            } else {
              Err((ServiceError::Unauthorized.into(), req))
            }
          }
          Err(_) => Err((ServiceError::BadRequest("Invalid token".to_string()).into(), req)),
        }
      };

      Box::pin(fut)
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
