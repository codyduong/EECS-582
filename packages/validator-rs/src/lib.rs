use std::fmt::Debug;

#[derive(Clone)]
pub enum Scope<T> {
  Value(T),
  And(Vec<Scope<T>>),
  Or(Vec<Scope<T>>),
  Not(Box<Scope<T>>),
}

impl<T: Clone> From<T> for Scope<T> {
  fn from(value: T) -> Self {
    Scope::Value(value)
  }
}

impl<T: Clone> From<Vec<T>> for Scope<T> {
  fn from(values: Vec<T>) -> Self {
    Scope::And(values.into_iter().map(Scope::from).collect())
  }
}

#[derive(Clone, Debug, PartialEq, thiserror::Error)]
pub enum ValidatorError {
  #[error("Unauthorized{}", ._0)]
  Unauthorized(String),
  #[error("Recursion Depth Exceeded")]
  RecursionDepthExceeded,
}

#[cfg(feature = "actix-web")]
impl actix_web::error::ResponseError for ValidatorError {
  fn error_response(&self) -> actix_web::HttpResponse {
    use actix_web::{http::StatusCode, HttpResponse};
    match self {
      ValidatorError::Unauthorized(msg) => HttpResponse::build(StatusCode::UNAUTHORIZED).body(msg.clone()),
      ValidatorError::RecursionDepthExceeded => HttpResponse::InternalServerError().json("Internal Server Error"),
    }
  }
}

#[cfg(feature = "anyhow")]
impl From<ValidatorError> for anyhow::Error {
  fn from(error: ValidatorError) -> Self {
    anyhow::anyhow!(error)
  }
}

const DEFAULT_RECURSION_LIMIT: usize = 64;

#[cfg(feature = "custom_recursion_limit")]
const RECURSION_LIMIT: usize = {
  option_env!("RECURSION_LIMIT")
    .map(|s| s.parse().unwrap_or(DEFAULT_RECURSION_LIMIT))
    .unwrap_or(DEFAULT_RECURSION_LIMIT)
};

#[cfg(not(feature = "custom_recursion_limit"))]
const RECURSION_LIMIT: usize = DEFAULT_RECURSION_LIMIT;

#[derive(Clone)]
pub struct ValidatorBuilder<T> {
  required_scopes: Option<Scope<T>>,
}

impl<T: PartialEq + Clone + Debug> Default for ValidatorBuilder<T> {
  fn default() -> Self {
    Self::new()
  }
}

impl<T: PartialEq + Clone + Debug> ValidatorBuilder<T> {
  pub fn new() -> Self {
    ValidatorBuilder { required_scopes: None }
  }

  pub fn with_scope<U: Into<Scope<T>>>(mut self, scope: U) -> Self {
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(Scope::And(vec![req, scope.into()])),
      None => Some(scope.into()),
    };
    self
  }

  pub fn with_and<U: Into<Scope<T>>>(mut self, requirements: Vec<U>) -> Self {
    let scopes = requirements.into_iter().map(Into::into).collect();
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(Scope::And(vec![req, Scope::And(scopes)])),
      None => Some(Scope::And(scopes)),
    };
    self
  }

  pub fn with_or<U: Into<Scope<T>>>(mut self, requirements: Vec<U>) -> Self {
    let scopes = requirements.into_iter().map(Into::into).collect();
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(Scope::And(vec![req, Scope::Or(scopes)])),
      None => Some(Scope::Or(scopes)),
    };
    self
  }

  pub fn with_not<U: Into<Scope<T>>>(mut self, requirement: U) -> Self {
    self.required_scopes = match self.required_scopes {
      Some(req) => Some(Scope::And(vec![req, Scope::Not(Box::new(requirement.into()))])),
      None => Some(Scope::Not(Box::new(requirement.into()))),
    };
    self
  }

  fn check_requirements(&self, permissions: &Vec<T>) -> Result<bool, ValidatorError> {
    match &self.required_scopes {
      Some(req) => self.check_requirement(req, permissions, 0),
      None => Ok(true),
    }
  }

  #[allow(clippy::only_used_in_recursion)]
  fn check_requirement(
    &self,
    requirement: &Scope<T>,
    permissions: &Vec<T>,
    depth: usize,
  ) -> Result<bool, ValidatorError> {
    if depth > RECURSION_LIMIT {
      return Err(ValidatorError::RecursionDepthExceeded);
    }

    match requirement {
      Scope::Value(value) => Ok(permissions.contains(value)),
      Scope::And(requirements) => requirements.iter().try_fold(true, |acc, r| {
        self.check_requirement(r, permissions, depth + 1).map(|val| acc && val)
      }),
      Scope::Or(requirements) => requirements.iter().try_fold(false, |acc, r| {
        self.check_requirement(r, permissions, depth + 1).map(|val| acc || val)
      }),
      Scope::Not(requirement) => self
        .check_requirement(requirement, permissions, depth + 1)
        .map(|val| !val),
    }
  }

  pub fn validate<U: Into<T> + Clone>(self, permissions: &[U]) -> Result<(), ValidatorError> {
    let converted_permissions: Vec<T> = permissions.iter().map(|p| p.clone().into()).collect();
    if self.check_requirements(&converted_permissions)? {
      Ok(())
    } else {
      Err(ValidatorError::Unauthorized("Unauthorized".to_string()))
    }
  }
}

#[cfg(feature = "bon")]
impl<T: Clone + PartialEq + Debug + 'static> From<bon::Bon<Scope<T>>> for ValidatorBuilder<T> {
  fn from(bon: bon::Bon<Scope<T>>) -> Self {
    ValidatorBuilder {
      required_scopes: Some(bon.into_inner()),
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[derive(Clone, PartialEq, Debug)]
  #[allow(clippy::enum_variant_names)]
  pub enum PermissionName {
    CreateAll,
    ReadAll,
    UpdateAll,
    #[allow(dead_code)]
    DeleteAll,
  }

  #[test]
  fn test_generic_validator() {
    #[derive(Debug, PartialEq, Clone)]
    enum TestEnum {
      A,
      B,
      #[allow(dead_code)]
      C,
    }

    let builder: ValidatorBuilder<TestEnum> = ValidatorBuilder::new().with_scope(TestEnum::A);
    assert_eq!(builder.check_requirements(&vec![TestEnum::A]), Ok(true));
    assert_eq!(builder.check_requirements(&vec![TestEnum::B]), Ok(false));
  }

  #[test]
  fn test_with_and_enums() {
    let builder: ValidatorBuilder<PermissionName> =
      ValidatorBuilder::new().with_and(vec![PermissionName::ReadAll, PermissionName::CreateAll]);
    assert_eq!(
      builder.check_requirements(&vec![PermissionName::ReadAll, PermissionName::CreateAll]),
      Ok(true)
    );
    assert_eq!(builder.check_requirements(&vec![PermissionName::ReadAll]), Ok(false));
  }

  #[test]
  fn test_with_or_enums() {
    let builder: ValidatorBuilder<PermissionName> =
      ValidatorBuilder::new().with_or(vec![PermissionName::ReadAll, PermissionName::CreateAll]);
    assert_eq!(builder.check_requirements(&vec![PermissionName::ReadAll]), Ok(true));
    assert_eq!(builder.check_requirements(&vec![PermissionName::CreateAll]), Ok(true));
    assert_eq!(builder.check_requirements(&vec![]), Ok(false));
  }

  #[test]
  fn test_with_not_enum() {
    let builder: ValidatorBuilder<PermissionName> = ValidatorBuilder::new().with_not(PermissionName::UpdateAll);
    assert_eq!(builder.check_requirements(&vec![PermissionName::ReadAll]), Ok(true));
    assert_eq!(builder.check_requirements(&vec![PermissionName::UpdateAll]), Ok(false));
  }

  #[cfg(feature = "bon")]
  #[test]
  fn test_bon_builder() {
    use crate::validator::Scope;
    use bon::Bon;

    let scope1 = Scope::Value(PermissionName::ReadAll);
    let scope2 = Scope::Value(PermissionName::CreateAll);

    let bon_builder: Bon<Scope<PermissionName>> = Bon::and(vec![scope1, scope2]);

    let validator_builder: ValidatorBuilder<PermissionName> = bon_builder.into();
    assert_eq!(
      validator_builder.check_requirements(&vec![PermissionName::ReadAll, PermissionName::CreateAll]),
      Ok(true)
    );
    assert_eq!(
      validator_builder.check_requirements(&vec![PermissionName::ReadAll]),
      Ok(false)
    );
  }

  // LOL, hackathon moment
  #[ignore]
  #[test]
  #[cfg(debug_assertions)]
  fn test_debug_error_messages() {
    let builder: ValidatorBuilder<PermissionName> = ValidatorBuilder::new()
      .with_scope(PermissionName::ReadAll)
      .with_scope(PermissionName::CreateAll);
    let user_permissions = vec![PermissionName::ReadAll];

    let result = builder.validate(&user_permissions);
    assert!(matches!(result, Err(ValidatorError::Unauthorized(_))));
    if let Err(ValidatorError::Unauthorized(msg)) = result {
      print!("{}", msg);
      assert!(msg.contains("Missing required permission:"));
    }

    let builder: ValidatorBuilder<PermissionName> = ValidatorBuilder::new().with_scope(PermissionName::ReadAll);
    let user_permissions = vec![PermissionName::ReadAll, PermissionName::CreateAll];

    let result = builder.validate(&user_permissions);
    assert!(matches!(result, Err(ValidatorError::Unauthorized(_))));
    if let Err(ValidatorError::Unauthorized(msg)) = result {
      assert!(msg.contains("Extra permission not expected:"));
    }
  }

  #[test]
  #[cfg(not(debug_assertions))]
  fn test_release_error_message() {
    let builder: ValidatorBuilder<PermissionName> = ValidatorBuilder::new()
      .with_scope(PermissionName::ReadAll)
      .with_scope(PermissionName::CreateAll);
    let user_permissions = vec![PermissionName::ReadAll];

    let result = builder.validate(&user_permissions);
    assert!(matches!(result, Err(ValidatorError::Unauthorized(_))));
    if let Err(ValidatorError::Unauthorized(msg)) = result {
      assert_eq!(msg, "Unauthorized");
    }

    let builder: ValidatorBuilder<PermissionName> = ValidatorBuilder::new().with_scope(PermissionName::ReadAll);
    let user_permissions = vec![PermissionName::ReadAll, PermissionName::CreateAll];

    let result = builder.validate(&user_permissions);
    assert!(matches!(result, Err(ValidatorError::Unauthorized(_))));
    if let Err(ValidatorError::Unauthorized(msg)) = result {
      assert_eq!(msg, "Unauthorized");
    }
  }

  #[test]
  fn test_recursion_limit() {
    let mut builder: ValidatorBuilder<PermissionName> = ValidatorBuilder::new();

    // Create deeply nested scope requirements
    let mut current_scope = Scope::Value(PermissionName::ReadAll);
    for _ in 0..RECURSION_LIMIT * 2 {
      current_scope = Scope::And(vec![current_scope, Scope::Value(PermissionName::CreateAll)]);
    }
    builder.required_scopes = Some(current_scope);

    let user_permissions = vec![PermissionName::ReadAll, PermissionName::CreateAll];

    let result = builder.validate(&user_permissions);
    print!("{:?}", result);
    assert!(matches!(result, Err(ValidatorError::RecursionDepthExceeded)));
  }
}
