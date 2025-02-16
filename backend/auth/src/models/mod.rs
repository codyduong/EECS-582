/*
  Name: mod.rs

  Description:
  Exports modules to rest of crate as public interface

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-05 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-05 - Cody Duong - add permission exports
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-12 - Cody Duong - abstract seperation of concerns better
  - 2025-02-16 - Cody Duong - add comments

  Postconditions: 
  - Every file under the parent directory `./models` should be exported
    glob style here
*/

mod permission;
pub use permission::*;
mod role_to_permission;
#[allow(unused_imports)]
use role_to_permission::*;
mod role;
pub use role::*;
mod user_to_role;
pub use user_to_role::*;
mod user;
pub use user::*;
