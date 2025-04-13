use serde::Deserialize;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Debug, Deserialize)]
pub struct PaginationParams<T> {
  #[serde(default)]
  pub first: Option<i32>,
  #[serde(default)]
  pub last: Option<i32>,
  #[serde(default)]
  pub after: Option<T>,
  #[serde(default)]
  pub before: Option<T>,
}

#[derive(Serialize, ToSchema)]
pub struct PageInfo {
  pub has_next_page: bool,
  pub has_prev_page: bool,
  pub start_cursor: Option<String>,
  pub end_cursor: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct Node<T: Serialize + ToSchema> {
  pub cursor: String,
  pub node: T,
}

#[derive(Serialize, ToSchema)]
pub struct Connection<T: Serialize + ToSchema> {
  pub edges: Vec<Node<T>>,
  pub page_info: PageInfo,
}

pub type GraphConnection<T> = Connection<T>;

// most maintainable macro
#[macro_export]
macro_rules! paginate {
  ($query:expr, $params:expr, $conn:expr, $id_column:expr, $cursor_fn:expr, $ret_ty:ty) => {{
    use common_rs::graphql::Connection;
    use common_rs::graphql::*;
    use diesel::{prelude::*, sql_types::BigInt, ExpressionMethods};

    // Validate pagination parameters
    if $params.first.is_some() && $params.last.is_some() {
      return Err(diesel::result::Error::RollbackTransaction.into());
    }

    if $params.after.is_some() && $params.before.is_some() {
      return Err(diesel::result::Error::RollbackTransaction.into());
    }

    let limit = $params.first.or($params.last).unwrap_or(20).clamp(1, 100);
    let is_forward = $params.first.is_some();

    // Main query construction
    let mut query = $query.into_boxed();

    match (is_forward, $params.after, $params.before) {
      // Forward pagination
      (true, after, None) => {
        if let Some(after_id) = after {
          query = query.filter($id_column.gt(after_id));
        }
        query = query.order($id_column.asc()).limit(limit as i64 + 1);
      }
      // Backward pagination
      (false, None, before) => {
        if let Some(before_id) = before {
          query = query.filter($id_column.lt(before_id));
        }
        query = query.order($id_column.desc()).limit(limit as i64 + 1);
      }
      _ => return Err(diesel::result::Error::RollbackTransaction.into()),
    }

    let mut items: Vec<$ret_ty> = query.load($conn)?;

    let has_additional = items.len() as i64 > limit.into();
    if has_additional {
      items.pop();
    }

    let start_cursor = items.first().map(|item| $cursor_fn(item));
    let end_cursor = items.last().map(|item| $cursor_fn(item));

    let has_next_page = if is_forward {
      has_additional
    } else {
      $params.before.is_some()
    };

    let has_previous_page = if is_forward {
      $params.after.is_some()
    } else {
      has_additional
    };

    let edges = items
      .into_iter()
      .map(|item| Node {
        cursor: $cursor_fn(&item),
        node: item,
      })
      .collect();

    Ok(Connection {
      edges,
      page_info: PageInfo {
        has_next_page,
        has_prev_page: has_previous_page,
        start_cursor,
        end_cursor,
      },
    })
  }};
}
