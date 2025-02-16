/*
  Name: mod.rs

  Description:
  The endpoint handler for `/api/v1/login`

  Programmer: Cody Duong
  Date Created: 2025-02-07
  Revision History:
  - 2025-02-08 - Cody Duong - init exports
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-09 - Cody Duong - fix failing ci with allow amibigious_glob_reexports
  - 2025-02-16 - Cody Duong - add comments

  Postconditions: 
  - Every file under the parent directory `./handlers` should be exported
    glob style here
*/

pub mod marketplaces;
#[allow(ambiguous_glob_reexports)]
pub use marketplaces::*;
pub mod products;
#[allow(ambiguous_glob_reexports)]
pub use products::*;
