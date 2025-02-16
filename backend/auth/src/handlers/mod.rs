/*
  Name: mod.rs

  Description:
  Exports select modules to rest of crate as public interface

  Programmer: Cody Duong
  Date Created: 2025-02-05
  Revision History:
  - 2025-02-05 - Cody Duong - PoC of diesel backend w/ openapi/swaggerui
  - 2025-02-07 - Cody Duong - add auth export
  - 2025-02-09 - Cody Duong - move file
  - 2025-02-16 - Cody Duong - add comments
*/

pub mod auth;
pub mod users;
