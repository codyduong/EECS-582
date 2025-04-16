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
  - 2025-93-26 - Cody Duong - add products_to_images

  Postconditions:
  - Every file under the parent directory `./handlers` should be exported
    glob style here
*/

pub mod companies;
pub mod marketplaces;
pub mod price_reports;
pub mod products_to_images;
pub mod products;
pub mod shopping_lists;
pub mod units;
